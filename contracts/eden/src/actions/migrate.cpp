#include <auctions.hpp>
#include <eden.hpp>
#include <migrations.hpp>

namespace eden
{
   void eden::migrate(uint32_t max_steps)
   {
      eosio::check(migrations{get_self()}.migrate_some(max_steps) != max_steps, "Nothing to do");
   }

   void eden::unmigrate()
   {
      eosio::require_auth(get_self());
      migrations{get_self()}.clear_all();
      auctions{get_self()}.clear_all();
      accounts{get_self(), "owned"_n}.clear_all();
      clear_secondary_index(member_table_type{get_self(), default_scope}.get_index<"byrep"_n>());
   }
}  // namespace eden
