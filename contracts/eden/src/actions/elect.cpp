#include <accounts.hpp>
#include <eden.hpp>
#include <elections.hpp>
#include <encrypt.hpp>
#include <members.hpp>
#include <migrations.hpp>

namespace eden
{
   void eden::electsettime(eosio::time_point_sec election_time)
   {
      eosio::require_auth(get_self());
      elections{get_self()}.set_next_election_time(election_time);
   }

   void eden::electconfig(uint8_t election_day,
                          const std::string& election_time,
                          uint32_t round_duration)
   {
      eosio::require_auth(get_self());

      elections elections{get_self()};
      elections.set_time(election_day, election_time);

      globals globals{get_self()};
      globals.set_election_round_duration(round_duration);
   }

   void eden::electopt(const eosio::not_in_abi<session_info>& current_session,
                       eosio::name voter,
                       bool participating)
   {
      current_session.value.require_auth(voter);

      members members{get_self()};
      const auto& member = members.get_member(voter);
      members.election_opt(member, participating);
   }

   void eden::electseed(const eosio::bytes& btc_header)
   {
      elections elections{get_self()};
      elections.seed(btc_header);
   }

   void eden::electmeeting(const eosio::not_in_abi<session_info>& current_session,
                           eosio::name account,
                           uint8_t round,
                           const std::vector<encrypted_key>& keys,
                           const eosio::bytes& data,
                           const std::optional<eosio::bytes>& old_data)
   {
      current_session.value.require_auth(account);
      members members{get_self()};
      elections elections{get_self()};
      auto group_id = elections.get_group_id(account, round);
      members.check_keys(elections.get_group_members(group_id), keys);
      encrypt encrypt{get_self(), "election"_n};
      encrypt.set(group_id, keys, data, old_data);
   }

   void eden::electvote(const eosio::not_in_abi<session_info>& current_session,
                        uint8_t round,
                        eosio::name voter,
                        eosio::name candidate)
   {
      current_session.value.require_auth(voter);
      elections elections(get_self());
      elections.vote(round, voter, candidate);
   }

   void eden::electvideo(const eosio::not_in_abi<session_info>& current_session,
                         uint8_t round,
                         eosio::name voter,
                         const std::string& video)
   {
      current_session.value.require_auth(voter);
      elections elections{get_self()};
      members members{get_self()};
      if (auto check = elections.can_upload_video(round, voter); boost::logic::indeterminate(check))
      {
         eosio::check(members.can_upload_video(round, voter),
                      "Cannot upload video for this election round");
      }
      else
      {
         eosio::check(static_cast<bool>(check), "Cannot upload video for this election round");
      }
      atomicassets::validate_ipfs(video);
   }

   void eden::electprocess(uint32_t max_steps)
   {
      elections elections(get_self());
      auto remaining = elections.prepare_election(max_steps);
      remaining = elections.finish_round(remaining);
      eosio::check(remaining != max_steps, "Nothing to do");
   }

   //chenke 20220927
   void eden::finishelect(eosio::time_point_sec election_time)
   {
      eosio::require_auth(get_self());
      elections{get_self()}.finish_curr_election(election_time);
   }

    //chenke 20230201
   void eden::changerank(eosio::name contract,std::vector<uint16_t> ranks){
      eosio::require_auth(get_self());
      members members{contract};
      members.set_ranks(ranks);
   }
   //chenke 20230201
   void eden::clearrank(eosio::name contract,std::vector<uint16_t> ranks){
      eosio::require_auth(get_self());
      members members{contract};
      members.clear_ranks();
   }
   
}  // namespace eden
