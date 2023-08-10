use cosmwasm_std::Uint128;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cw_storage_plus::Item;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {

    /* Id of the contract uploaded to the chain used to instantiate
    the different tokens
    https://docs.terra.money/docs/develop/module-specifications/spec-wasm.html#code-id */
    pub token_contract_code_id: u64,

    pub native_factory_token_address: String,
    pub service_fee: Uint128,
    pub min_feature_cost: Uint128,
    pub dist_percent: u128,
    pub dist_address: String,
    pub admin_address: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct TokenData {
    pub token_contract: String,
    pub feature_cost: Uint128,
    pub visible: bool,
    pub timestamp: u64
}

pub const CONFIG: Item<Config> = Item::new("config");
pub const MINTED_TOKENS: Item<Vec<TokenData>> = Item::new("minted_tokens");


