#include <nodeos-runner.hpp>

TEST_CASE("Setup Eden chain with basic completed genesis")
{
   nodeos_runner r("chain-genesis");

   r.tester.genesis();

   r.start_nodeos();
}

TEST_CASE("budget distribution")
{
   eden_tester t;
   t.genesis();
   t.set_balance(s2a("36.0000 EOS"));
   t.run_election();

   t.alice.act<actions::distribute>(250);
   CHECK(t.get_total_budget() == s2a("1.8000 EOS"));
   // Skip forward to the next distribution
   t.skip_to("2020-08-03T15:29:59.500");
   expect(t.alice.trace<actions::distribute>(250), "Nothing to do");
   t.chain.start_block();
   t.alice.act<actions::distribute>(250);
   CHECK(t.get_total_budget() == s2a("3.5100 EOS"));
   // Skip into the next election
   t.skip_to("2021-01-02T15:30:00.000");
   t.alice.act<actions::distribute>(1);
   t.alice.act<actions::distribute>(5000);
   CHECK(t.get_total_budget() == s2a("10.9435 EOS"));

   expect(t.alice.trace<actions::fundtransfer>("alice"_n, s2t("2020-07-04T15:30:00.000"), 1,
                                               "egeon"_n, s2a("1.8001 EOS"), "memo"),
          "insufficient balance");
   expect(t.alice.trace<actions::fundtransfer>("alice"_n, s2t("2020-07-04T15:30:00.000"), 1,
                                               "egeon"_n, s2a("-1.0000 EOS"), "memo"),
          "amount must be positive");
   expect(t.alice.trace<actions::fundtransfer>("alice"_n, s2t("2020-07-04T15:30:00.000"), 1,
                                               "ahab"_n, s2a("1.0000 EOS"), "memo"),
          "member ahab not found");

   t.alice.act<actions::fundtransfer>("alice"_n, s2t("2020-07-04T15:30:00.000"), 1, "egeon"_n,
                                      s2a("1.8000 EOS"), "memo");
   CHECK(get_eden_account("egeon"_n)->balance() == s2a("1.8000 EOS"));

   expect(t.alice.trace<actions::usertransfer>("alice"_n, "ahab"_n, s2a("10.0000 EOS"), "memo"),
          "member ahab not found");
   t.ahab.act<token::actions::transfer>("ahab"_n, "eden.gm"_n, s2a("10.0000 EOS"), "memo");
   expect(t.ahab.trace<actions::usertransfer>("ahab"_n, "egeon"_n, s2a("10.0000 EOS"), "memo"),
          "member ahab not found");
   expect(t.alice.trace<actions::usertransfer>("alice"_n, "egeon"_n, s2a("-1.0000 EOS"), "memo"),
          "amount must be positive");
   t.alice.act<actions::usertransfer>("alice"_n, "egeon"_n, s2a("10.0000 EOS"), "memo");
   CHECK(get_eden_account("egeon"_n)->balance() == s2a("11.8000 EOS"));
   CHECK(get_eden_account("alice"_n)->balance() == s2a("80.0000 EOS"));
   CHECK(get_eden_account("ahab"_n)->balance() == s2a("10.0000 EOS"));
}