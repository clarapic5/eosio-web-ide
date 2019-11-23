#include <boost/test/unit_test.hpp>
#include <eosio/chain/abi_serializer.hpp>
#include <eosio/chain/permission_object.hpp>
#include <eosio/chain/resource_limits.hpp>
#include <eosio/testing/tester.hpp>

using namespace eosio;
using namespace eosio::chain;
using namespace eosio::testing;
using namespace fc;

BOOST_AUTO_TEST_SUITE(training_tests)

BOOST_AUTO_TEST_CASE(post) try {
    tester t{setup_policy::none};

    // Load contract
    t.create_account(N(training));
    t.set_code(N(training), read_wasm("training.wasm"));
    t.set_abi(N(training), read_abi("training.abi").data());
    t.produce_block();

    // Create users
    t.create_account(N(john));
    t.create_account(N(jane));

    // Test "post" action
    t.push_action(
        N(training), N(post), N(john),
        mutable_variant_object //
        ("id", 1)              //
        ("reply_to", 0)        //
        ("user", "john")       //
        ("heart_rate", 255)    //
        ("distance", 1)        //
        ("speed", 9)           //
        ("time", 150)          //
    );
    t.push_action(
        N(training), N(post), N(jane),
        mutable_variant_object //
        ("id", 2)              //
        ("reply_to", 0)        //
        ("user", "jane")       //
        ("heart_rate", 190)      //
        ("distance", 20)        //
        ("speed", 7)           //
        ("time", 100)            //
    );
    t.push_action(
        N(training), N(post), N(john),
        mutable_variant_object       //
        ("id", 3)                    //
        ("reply_to", 2)              //
        ("user", "john")             //
        ("heart_rate", 180)            //
        ("distance", 20)              //
        ("speed", 6)                 //
        ("time", 150)                  //
    );

    // Can't reply to non-existing message
    BOOST_CHECK_THROW(
        [&] {
            t.push_action(
                N(training), N(post), N(john),
                mutable_variant_object       //
                ("id", 4)                    //
                ("reply_to", 99)             //
                ("user", "john")             //
                ("heart_rate", 200)            //
                ("distance", 15)              //
                ("speed", 5)                 //
                ("time", 180)                  //
            );
        }(),
        fc::exception);
}
FC_LOG_AND_RETHROW()

BOOST_AUTO_TEST_SUITE_END()
