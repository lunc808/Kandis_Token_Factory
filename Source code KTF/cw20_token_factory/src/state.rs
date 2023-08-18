use cosmwasm_std::Uint128;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cw_storage_plus::{Item, Map};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {

    /* Id of the contract uploaded to the chain used to instantiate
    the different tokens
    https://docs.terra.money/docs/develop/module-specifications/spec-wasm.html#code-id */
    pub token_contract_code_id: u64,
    pub native_factory_token_address: String,
    pub service_fee: Uint128,
    pub dist_percent: u128,
    pub dist_address: String,
    pub admin_address: String,
    pub lp_token_address: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct TokenData {
    pub token_contract: String,
    pub token_issuer: String,
    pub visible: bool,
    pub is_imported: bool,
}



pub const CONFIG: Item<Config> = Item::new("config");
pub const MINTED_TOKENS: Item<Vec<TokenData>> = Item::new("minted_tokens");
pub const PENDING_CREATOR: Item<String> = Item::new("pending");

pub const VOTED_TOKENS: Map<String, String> = Map::new("voted_token"); // Key: voter, Value: token
pub const VOTED_USERS: Map<String, Vec<String>> = Map::new("voted_user"); // Key: token, Value: voters

pub const FEATURED_TOKENS: Map<String, String> = Map::new("featured_token"); // key: owner, value: token
pub const FEATURED_USERS: Map<String, String> = Map::new("featured_user");  // key: token, value: featured owner.




