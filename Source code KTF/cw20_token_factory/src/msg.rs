use cosmwasm_std::Uint128;
use schemars::JsonSchema;
use cw20::Cw20ReceiveMsg;
use serde::{Deserialize, Serialize};

use crate::state::TokenData;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    /* Id of the contract uploaded for the first time to the chain
    https://docs.terra.money/docs/develop/module-specifications/spec-wasm.html#code-id */
    pub token_contract_code_id: u64,
    pub native_factory_token_address: String,
    pub lp_token_address: String,
    pub service_fee: Option<Uint128>,
    pub dist_percent: Option<u128>,
    pub dist_address: Option<String>,
    pub admin_address: Option<String>
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    Receive(Cw20ReceiveMsg),
    UpdateServiceInfo { service_fee: Uint128, dist_percent: u128, dist_address: String, admin_address: String },
    Withdraw{ amount: Option<Uint128>},    
    ImportToken { token: String },
    UpdateVisible { token: String, visible: bool },
    VoteToken {token: String},
    FeatureToken {token: String},
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum DepositType {
    /* Instantiate a CW20_base token */
    Instantiate(cw20_base::msg::InstantiateMsg),
}


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryFactoryTokenMessage {
    Balance { address: String },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    /* Returns the list of token addresses that were created with this contract */
    GetMintedTokens { },
    GetServiceInfo { },
    GetFactoryTokenBalance {},
    GetTokenFeatureInfo{
        token: String
    },
    GetLeaderboard {
        count: u128
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct MintedTokens {
    pub minted_tokens: Vec<TokenResponse>,
    pub max_of_issuer: Uint128,
    pub max_of_member: Uint128,
}


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct TokenResponse {
    pub token_contract: String,
    pub token_issuer: String,
    pub visible: bool,
    pub is_imported: bool,
    pub amount_of_member: Uint128,
    pub amount_of_issuer: Uint128
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct LeaderBoardResponse {
    pub tokens: Vec<TokenRanking>,
}


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct TokenRanking {
    pub token: String,
    pub amount_of_issuer: Uint128
}


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct ServiceInfo {
    pub service_fee: Uint128,
    pub dist_percent: u128,
    pub dist_address: String,
    pub admin_address: String,
}


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct TokenFeatureInfo {
    pub token_contract: String,
    pub token_issuer: String,
    pub visible: bool,
    pub is_imported: bool,
    pub amount_of_issuer: Uint128,
    pub amount_of_member: Uint128,
    pub max_of_issuer: Uint128,
    pub max_of_member: Uint128,    
}


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct FactoryTokenBalance {
    pub balance: Uint128,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MigrateMsg {}
