#include <eosio/eosio.hpp>

// Activity table
struct [[eosio::table("activity"), eosio::contract("training")]] activity {
    uint64_t    id       = {}; // Non-0
    uint64_t    reply_to = {}; // Non-0 if this is a reply
    eosio::name user     = {}; // account name of the user
    uint64_t heart_rate  = {};
    uint64_t distance    = {}; 
    uint64_t speed       = {};
    uint64_t time        = {};


    uint64_t primary_key() const { return id; }
    uint64_t get_reply_to() const { return reply_to; }
};

using activity_table = eosio::multi_index<
    "activity"_n, activity, eosio::indexed_by<"by.reply.to"_n, eosio::const_mem_fun<activity, uint64_t, &activity::get_reply_to>>>;

// The contract
class training : eosio::contract {
  public:
    // Use contract's constructor
    using contract::contract;

    // Post a activity
    [[eosio::action]] void post(uint64_t id, uint64_t reply_to, eosio::name user, uint64_t heart_rate, uint64_t distance, uint64_t speed, uint64_t time) {
        activity_table table{get_self(), 0};

        // Check user
        require_auth(user);

        // Check reply_to exists
        if (reply_to)
            table.get(reply_to);

        // Create an ID if user didn't specify one
        eosio::check(id < 1'000'000'000ull, "user-specified id is too big");
        if (!id)
            id = std::max(table.available_primary_key(), 1'000'000'000ull);

        // Record the activity
        table.emplace(get_self(), [&](auto& activity) {
            activity.id       = id;
            activity.reply_to = reply_to;
            activity.user     = user;
            activity.heart_rate = heart_rate;
            activity.distance = distance;
            activity.speed = speed;
            activity.time = time;
        });
    }
};