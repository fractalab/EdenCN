#include <elections.hpp>
#include <members.hpp>
#include <sessions.hpp>

namespace eden
{
   uint32_t migrate_member_v0::migrate_some(eosio::name contract, uint32_t max_steps)
   {
      member_table_type member_tb{contract, default_scope};
      member_tb.update_index<"byrep"_n>(contract, next_primary_key, max_steps);
      return max_steps;
   }

   const member& members::get_member(eosio::name account)
   {
      return member_tb.get(account.value, ("member " + account.to_string() + " not found").c_str());
   }

   void members::check_active_member(eosio::name account)
   {
      eosio::check(get_member(account).status() == member_status::active_member,
                   "inactive member " + account.to_string());
   }

   void members::check_pending_member(eosio::name account)
   {
      eosio::check(get_member(account).status() == member_status::pending_membership,
                   "member " + account.to_string() + " is not pending");
   }

   bool members::is_new_member(eosio::name account) const
   {
      auto itr = member_tb.find(account.value);
      return itr == member_tb.end();
   }

   void members::check_keys(const std::vector<eosio::name>& accounts,
                            const std::vector<encrypted_key>& keys)
   {
      std::vector<eosio::public_key> actual_keys;
      std::vector<eosio::public_key> expected_keys;
      actual_keys.reserve(keys.size());
      expected_keys.reserve(accounts.size());
      for (auto account : accounts)
      {
         const auto& member = member_tb.get(account.value);
         if (member.encryption_key())
         {
            expected_keys.push_back(*member.encryption_key());
         }
      }
      eosio::check(expected_keys.size() == keys.size(), "Wrong number of encyption keys");
      for (const auto& key : keys)
      {
         actual_keys.push_back(key.recipient_key);
      }
      std::sort(actual_keys.begin(), actual_keys.end());
      std::sort(expected_keys.begin(), expected_keys.end());
      eosio::check(actual_keys == expected_keys, "Wrong encryption key");
   }

   void members::set_key(eosio::name member, const eosio::public_key& key)
   {
      member_tb.modify(get_member(member), contract, [&](auto& row) {
         auto next = std::visit([](auto& m) { return member_v1{m}; }, row.value);
         next.encryption_key = key;
         row.value = std::move(next);
      });
   }

   void members::create(eosio::name account)
   {
      auto stats = this->stats();
      ++stats.pending_members;
      eosio::check(stats.pending_members != 0, "Integer overflow");
      member_stats.set(stats, contract);
      member_tb.emplace(contract, [&](auto& row) {
         row.account() = account;
         row.status() = member_status::pending_membership;
         row.nft_template_id() = 0;
      });
   }

   member_table_type::const_iterator members::erase(member_table_type::const_iterator iter)
   {
      auto stats = this->stats();
      switch (iter->status())
      {
         case member_status::pending_membership:
            eosio::check(stats.pending_members != 0, "Integer overflow");
            --stats.pending_members;
            break;
         case member_status::active_member:
            eosio::check(stats.active_members != 0, "Integer overflow");
            --stats.active_members;
            if (iter->representative() != eosio::name(-1))
            {
               --stats.ranks[iter->election_rank()];
            }
            break;
         default:
            eosio::check(false, "Invariant failure: unknown member status");
            break;
      }
      member_stats.set(stats, contract);
      remove_sessions(contract, iter->account());
      return member_tb.erase(iter);
   }

   void members::remove(eosio::name account)
   {
      auto iter = member_tb.find(account.value);
      eosio::check(iter != member_tb.end(), "Unknown member");
      erase(iter);
   }

   void members::remove_if_pending(eosio::name account)
   {
      const auto& member = member_tb.get(account.value);
      if (member.status() == member_status::pending_membership)
      {
         remove_sessions(contract, account);
         member_tb.erase(member);
         auto stats = this->stats();
         eosio::check(stats.pending_members != 0, "Integer overflow");
         --stats.pending_members;
         member_stats.set(stats, contract);
      }
   }

   void members::rename(eosio::name account, eosio::name new_account)
   {
      auto iter = member_tb.find(account.value);
      eosio::check(iter != member_tb.end(), "Unknown member");
      std::uint8_t rank = iter->election_rank();
      remove_sessions(contract, account);
      // Update the members table entry
      member_tb.emplace(contract, [&](auto& new_member) {
         new_member = *iter;
         new_member.account() = new_account;
      });
      member_tb.erase(iter);
      // update delegate records
      auto delegate_idx = member_tb.get_index<"byrep"_n>();
      for (uint8_t i = 0; i <= rank; ++i)
      {
         for (auto iter = delegate_idx.lower_bound((uint128_t{i} << 64) | account.value),
                   end = delegate_idx.end();
              iter != end && iter->representative() == account;)
         {
            auto next = iter;
            ++next;
            delegate_idx.modify(iter, contract,
                                [&](auto& member) { member.representative() = new_account; });
            iter = next;
         }
      }
   }

   void members::set_nft(eosio::name account, int32_t nft_template_id)
   {
      check_pending_member(account);
      const auto& member = get_member(account);
      member_tb.modify(member, eosio::same_payer,
                       [&](auto& row) { row.nft_template_id() = nft_template_id; });
   }

   void members::set_active(eosio::name account, const std::string& name)
   {
      auto stats = this->stats();
      eosio::check(stats.pending_members > 0, "Invariant failure: no pending members");
      eosio::check(stats.active_members < max_active_members,
                   "Invariant failure: active members too high");
      --stats.pending_members;
      ++stats.active_members;
      member_stats.set(stats, eosio::same_payer);
      check_pending_member(account);
      current_election_state_singleton election_state(contract, default_scope);
      const auto& member = get_member(account);
      member_tb.modify(member, eosio::same_payer, [&](auto& row) {
         row.value = member_v1{{.account = row.account(),
                                .name = name,
                                .status = member_status::active_member,
                                .nft_template_id = row.nft_template_id(),
                                .election_participation_status = 0}};
      });
   }

   void members::set_rank(eosio::name member, uint8_t rank, eosio::name representative)
   {
      member_tb.modify(member_tb.get(member.value), contract, [&](auto& row) {
         row.value = std::visit([](auto& v) { return member_v1{v}; }, row.value);
         row.election_rank() = rank;
         row.representative() = representative;
         row.election_participation_status() = 0;
      });
      auto stats = this->stats();
      if (representative != eosio::name(-1))
      {
         if (stats.ranks.size() <= rank)
         {
            stats.ranks.resize(rank + 1);
         }
         ++stats.ranks[rank];
      }
      member_stats.set(stats, contract);
   }

   void members::clear_ranks()
   {
      auto stats = this->stats();
      stats.ranks.clear();
      member_stats.set(stats, contract);
   }
   //chenke 20230201
   void members::set_ranks(std::vector<uint16_t> ranks)
   {
      auto stats = this->stats();
      //stats.ranks.clear(); 这里不能清除
      //eosio::check(ranks.size() > 2, "ranks must be more than 2");
      for(size_t i = 0; i < ranks.size(); ++i){
         stats.ranks.push_back(ranks[i]);
      }
      //stats.ranks.push_back(20);
      // stats.ranks.push_back(1);
      //eosio::check(stats.ranks.size() > 0, "stats.ranks must be more than 1");
      member_stats.set(stats, contract);
   }


   void members::election_opt(const member& member, bool participating)
   {
      check_active_member(member.account());

      elections elections{contract};
      auto election_time = elections.get_next_election_time();
      eosio::check(
          election_time && eosio::current_time_point() + eosio::seconds(election_seeding_window) <
                               election_time->to_time_point(),
          "Registration has closed");

      uint8_t new_participation_status;
      if (participating)
      {
         new_participation_status = elections.election_schedule_version();
         eosio::check(member.election_participation_status() != new_participation_status,
                      "Not currently opted out");
      }
      else
      {
         new_participation_status = not_in_election;
         eosio::check(
             member.election_participation_status() == elections.election_schedule_version(),
             "Not currently opted in");
      }

      member_tb.modify(member, eosio::same_payer, [&](auto& row) {
         row.value = std::visit([](auto& v) { return member_v1{v}; }, row.value);
         row.election_participation_status() = new_participation_status;
      });
   }

   bool members::can_upload_video(uint8_t round, eosio::name member)
   {
      auto iter = member_tb.find(member.value);
      return iter != member_tb.end() && iter->election_rank() >= round &&
             iter->representative() != eosio::name(-1);
   }

   struct member_stats_v1 members::stats()
   {
      return std::visit([](const auto& stats) { return member_stats_v1{stats}; },
                        member_stats.get_or_default());
   }

   void members::maybe_activate_contract()
   {
      if (globals.get().stage == contract_stage::genesis)
      {
         if (stats().pending_members == 0)
         {
            globals.set_stage(contract_stage::active);
            // Lock the supply of genesis NFTs
            for (const auto& member : member_tb)
            {
               eosio::action({contract, "active"_n}, atomic_assets_account, "locktemplate"_n,
                             std::tuple(contract, contract, member.nft_template_id()))
                   .send();
            }
         }
      }
   }

   void members::clear_all()
   {
      clear_table(member_tb);
      clear_singleton(member_stats, contract);
   }
}  // namespace eden
