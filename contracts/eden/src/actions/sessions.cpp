#include <constants.hpp>
#include <eden.hpp>
#include <events.hpp>
#include <members.hpp>

namespace eden
{
   void set_expiration(session_container& sc)
   {
      auto expiration = eosio::block_timestamp::max();
      for (auto& session : sc.sessions())
         expiration = std::min(expiration, session.expiration);
      sc.earliest_expiration() = expiration;
   }

   void expire(eosio::name contract, session_container& sc)
   {
      auto now = eosio::current_block_time();
      auto& sessions = sc.sessions();
      for (auto& session : sessions)
         if (session.expiration <= now)
            push_event(session_del_event{sc.eden_account(), session.key}, contract);
      auto new_end = std::remove_if(sessions.begin(), sessions.end(),
                                    [&](auto& session) { return session.expiration <= now; });
      sessions.erase(new_end, sessions.end());
   }

   uint32_t gc_sessions(eosio::name contract, uint32_t remaining)
   {
      auto now = eosio::current_block_time();
      sessions_table_type table(contract, default_scope);
      auto idx = table.get_index<"byexpiration"_n>();
      while (remaining && idx.begin() != idx.end() && idx.begin()->earliest_expiration() <= now)
      {
         auto& sc = *idx.begin();
         table.modify(sc, contract, [&](auto& sc) {
            expire(contract, sc);
            set_expiration(sc);
         });
         if (sc.sessions().empty())
            table.erase(sc);
         --remaining;
      }
      return remaining;
   }

   void clearall_sessions(eosio::name contract)
   {
      sessions_table_type table(contract, default_scope);
      while (table.begin() != table.end())
         table.erase(table.begin());
   }

   void remove_sessions(eosio::name contract, eosio::name eden_account)
   {
      sessions_table_type table(contract, default_scope);
      auto it = table.find(eden_account.value);
      if (it == table.end())
         return;
      for (auto& session : it->sessions())
         push_event(session_del_event{eden_account, session.key}, contract);
      table.erase(it);
   }

   void eden::newsession(eosio::name eden_account,
                         const eosio::public_key& key,
                         eosio::block_timestamp expiration,
                         const std::string& description)
   {
      eosio::require_auth(eden_account);
      eosio::check(key.index() < 2, "unsupported key type");
      eosio::check(expiration > eosio::current_block_time(), "session is expired");
      eosio::check(expiration <= eosio::current_block_time().to_time_point() + eosio::days(90),
                   "expiration is too far in the future");
      eosio::check(description.size() <= 20, "description is too long");
      members(get_self()).get_member(eden_account);

      sessions_table_type table(get_self(), default_scope);
      auto sc = table.find(eden_account.value);
      if (sc == table.end())
      {
         table.emplace(get_self(), [&](auto& sc) {
            sc.eden_account() = eden_account;
            sc.earliest_expiration() = expiration;
            sc.sessions().push_back(session_v0{
                .key = key,
                .expiration = expiration,
                .description = description,
            });
         });
      }
      else
      {
         table.modify(sc, get_self(), [&](auto& sc) {
            expire(get_self(), sc);
            auto& sessions = sc.sessions();
            auto session = std::find_if(sessions.begin(), sessions.end(),
                                        [&](auto& session) { return session.key == key; });
            eosio::check(session == sessions.end(), "session key already exists");
            sessions.push_back(session_v0{
                .key = key,
                .expiration = expiration,
                .description = description,
            });
            if (sessions.size() > 4)
               sessions.erase(sessions.begin());
            set_expiration(sc);
         });
      }
      push_event(session_new_event{eden_account, key, expiration, description}, get_self());
   }  // eden::newsession

   void eden::delsession(const eosio::not_in_abi<session_info>& current_session,
                         eosio::name eden_account,
                         const eosio::public_key& key)
   {
      current_session.value.require_auth(eden_account);
      sessions_table_type table(get_self(), default_scope);
      auto sc = table.find(eden_account.value);
      eosio::check(sc != table.end(), "Session key is either expired or not found");
      bool empty = false;
      table.modify(sc, get_self(), [&](auto& sc) {
         auto& sessions = sc.sessions();
         auto session = std::find_if(sessions.begin(), sessions.end(),
                                     [&](auto& session) { return session.key == key; });
         eosio::check(session != sessions.end(), "Session key is either expired or not found");
         push_event(session_del_event{sc.eden_account(), session->key}, get_self());
         sessions.erase(session);
         expire(get_self(), sc);
         set_expiration(sc);
         empty = sessions.empty();
      });
      if (empty)
         table.erase(sc);
   }  // eden::delsession

   void eden::run(eosio::ignore<run_auth> auth, eosio::ignore<std::vector<verb>> verbs)
   {
      auto& ds = get_datastream();
      eosio::name eden_account;
      eosio::varuint32 auth_type;
      ds >> auth_type;
      if (auth_type.value == (int)run_auth_type::no_auth)
      {
      }
      else if (auth_type.value == (int)run_auth_type::account_auth)
      {
         account_auth a;
         ds >> a;
         eosio::check(a.contract == get_self(), "unsupported contract for auth");
         eosio::check(a.contract_account == a.eosio_account,
                      "account recovery not yet implemented");
         eosio::require_auth(a.eosio_account);
         eden_account = a.contract_account;
      }
      else if (auth_type.value == (int)run_auth_type::signature_auth)
      {
         eosio::signature signature;
         eosio::name contract;
         eosio::varuint32 sequence;
         ds >> signature;
         auto digest = eosio::sha256(ds.pos(), ds.remaining());
         auto recovered = eosio::recover_key(digest, signature);
         ds >> contract;
         ds >> eden_account;
         ds >> sequence;
         eosio::check(contract == get_self(), "unsupported contract for auth");

         sessions_table_type table(get_self(), default_scope);
         auto sc = table.find(eden_account.value);
         if (sc == table.end())
            eosio::check(false, "Recovered session key " + public_key_to_string(recovered) +
                                    " is either expired or not found");
         table.modify(sc, get_self(), [&](auto& sc) {
            expire(get_self(), sc);
            set_expiration(sc);
            auto& sessions = sc.sessions();
            auto session = std::find_if(sessions.begin(), sessions.end(),
                                        [&](auto& session) { return session.key == recovered; });
            if (session == sessions.end())
               eosio::check(false, "Recovered session key " + public_key_to_string(recovered) +
                                       " is either expired or not found");

            auto& sequences = session->sequences;
            if (sequences.begin() != sequences.end())
            {
               if (sequence.value < *sequences.begin() && sequences.size() >= 20)
                  eosio::check(false,
                               "received duplicate sequence " + std::to_string(sequence.value));
               else if (sequence.value > sequences.end()[-1].value + 10)
                  eosio::check(false,
                               "sequence " + std::to_string(sequence.value) + " skips too many");
            }
            else if (sequence.value > 10)
               eosio::check(false,
                            "sequence " + std::to_string(sequence.value) + " skips too many");
            auto it = std::lower_bound(sequences.begin(), sequences.end(), sequence);
            if (it != sequences.end() && *it == sequence)
               eosio::check(false, "received duplicate sequence " + std::to_string(sequence.value));
            sequences.insert(it, sequence);
            if (sequences.size() > 20)
               sequences.erase(sequences.begin());
         });
      }
      else
      {
         eosio::check(false, "unsupported auth type");
      }

      eosio::not_in_abi<session_info> current_session;
      current_session.value.authorized_eden_account = eden_account;

      eosio::varuint32 num_verbs;
      ds >> num_verbs;
      eosio::check(num_verbs.value > 0, "verbs is empty");
      for (uint32_t i = 0; i < num_verbs.value; ++i)
      {
         eosio::varuint32 index;
         ds >> index;
         eosio::check(actions::session_dispatch(get_self(), index.value, current_session, ds),
                      "unsupported verb index");
      }

      eosio::check(!ds.remaining(), "detected extra verb data");
   }  // eden::run
}  // namespace eden
