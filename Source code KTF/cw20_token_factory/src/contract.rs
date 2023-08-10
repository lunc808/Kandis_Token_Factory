use std::borrow::BorrowMut;
use std::time::{SystemTime, UNIX_EPOCH};
use std::vec;

use crate::error::ContractError;
use crate::msg::{DepositType, ExecuteMsg, InstantiateMsg, MigrateMsg, MintedTokens, QueryMsg, ServiceInfo, QueryFactoryTokenMessage, FactoryTokenBalance};
use crate::state::{Config, CONFIG, MINTED_TOKENS, TokenData};
#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{
    to_binary, Binary, Coin, Deps, DepsMut, Env, MessageInfo, Reply,
    Response, StdError, StdResult, SubMsg, Uint128, WasmMsg, from_binary, BankMsg, QueryRequest, QuerierWrapper,
};
use cw20::{
    BalanceResponse as CW20BalanceResponse, Cw20ExecuteMsg, Cw20QueryMsg, Cw20ReceiveMsg, Denom,
    TokenInfoResponse, Cw20Coin,
};
use cw2::set_contract_version;

/* Define contract name and version */
const CONTRACT_NAME: &str = "crates.io:token-factory";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");
const INSTANTIATE_REPLY_ID: u64 = 1;

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    /* Define the initial configuration for this contract that way you can
    limit the type of coin you want to accept each time a token-factory is
    created and also which kind of token would you like to mint based on
    the code id of the contract deployed */
    let state = Config {
        token_contract_code_id: msg.token_contract_code_id,
        native_factory_token_address: msg.native_factory_token_address,
        service_fee: msg.service_fee.unwrap_or(Uint128::new(20000000)),
        min_feature_cost: msg.min_feature_cost.unwrap_or(Uint128::new(20000000)),
        dist_address: msg.dist_address.unwrap_or("terra1yqx43ej26lqxg8ceepwcl663l8dc6vznjzmgcy".to_string()),
        dist_percent: msg.dist_percent.unwrap_or(2),
        admin_address: msg.admin_address.unwrap_or("terra1yqx43ej26lqxg8ceepwcl663l8dc6vznjzmgcy".to_string())
    };
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    CONFIG.save(deps.storage, &state)?;
    MINTED_TOKENS.save(deps.storage, &Vec::new())?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute(
            "token_contract_code_id",
            msg.token_contract_code_id.to_string(),
        ))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Receive(msg) => execute_receive(deps, env, info, msg),
        ExecuteMsg::UpdateServiceInfo{service_fee, dist_percent, dist_address, admin_address} 
            => execute_update_service_info(deps, info, service_fee, dist_percent, dist_address, admin_address),
        /* Method used to burn an existent token created thru this contract
        and send the LUNA back to the address that burn these tokens.*/
        ExecuteMsg::Widthdraw { amount } => execute_withdraw(deps, info, amount),
        ExecuteMsg::ImportToken { token } => execute_import(deps, info, token),
    }
}

pub fn execute_receive(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    wrapper: Cw20ReceiveMsg,
) -> Result<Response, ContractError> {
    let cfg = CONFIG.load(deps.storage)?;
    if wrapper.amount == Uint128::zero() {
        return Err(ContractError::InvalidInput {});
    }

    if info.sender.clone() != cfg.native_factory_token_address {
        return Err(ContractError::UnacceptableToken {});
    }

    let msg: DepositType = from_binary(&wrapper.msg)?;
    match msg {
        DepositType::Instantiate(token_data) => {
            if wrapper.amount.ne(&cfg.service_fee)  {
                return Err(ContractError::ReceivedFundsMismatchWithMintAmount {
                    received_amount: wrapper.amount,
                    expected_amount: cfg.service_fee,
                });
            }
            execute_instantiate_token(deps, env, info, token_data)
        },
        DepositType::Featured{token} => {
            if wrapper.amount.lt(&cfg.min_feature_cost)  {
                return Err(ContractError::ReceivedFundsLessThanMinFeaturedCost {
                    received_amount: wrapper.amount,
                    min_amount: cfg.min_feature_cost,
                });
            }
            execute_featured(deps, env, info, token, wrapper.amount)
        }
    }
}


pub fn execute_instantiate_token(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    mut token_data: cw20_base::msg::InstantiateMsg,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    
    /* If a minter exists replace the minter address with
    the token-factory address that way the minting is only
    allowed thru this smart contract. */
    token_data.mint = match token_data.mint {
        None => None,
        Some(mut e) => {
            e.minter = env.contract.address.to_string();
            Some(e)
        }
    };

    let mut expected_amount = Uint128::zero();
    

    /* Add all initial token supply */
    token_data
        .initial_balances
        .iter()
        .for_each(|t| expected_amount += t.amount);

    let token_dist = expected_amount.multiply_ratio(Uint128::new(config.dist_percent), Uint128::new(100));
    let ballance_dist = Cw20Coin {
        amount: token_dist,
        address:  config.dist_address,
    };

    let mut new_token_data = token_data.clone();
    let mut duplicated = false;

    let mut iterator = new_token_data.initial_balances.iter_mut();
    while let Some(element) = iterator.next() { 
        if element.address.clone() == config.admin_address {
            (*element).amount += token_dist;
            duplicated = true;
        }
    }

    if !duplicated {
        new_token_data.initial_balances.push(ballance_dist);
    }

    /* Create a WasmMsg to mint new CW20-base token.
    https://github.com/CosmWasm/cw-plus/tree/0.9.x/contracts/cw20-base */
    let instantiate_message = WasmMsg::Instantiate {
        admin: Some(info.sender.to_string()),
        code_id: config.token_contract_code_id,
        msg: to_binary(&new_token_data)?,
        funds: vec![],
        label: token_data.name,
    };

    /* Define the SubMessage on CosmWasm API to allow a callback on reply
    entry point. This call will be executed with INSTANTIATE_REPLY_ID if
    the call succeed after being executed by the method add_submessage(response)
    from Response implementation.
    More Info: https://docs.cosmwasm.com/docs/1.0/smart-contracts/message/submessage */
    let sub_msg = SubMsg::reply_on_success(instantiate_message, INSTANTIATE_REPLY_ID);

    /* Respond with the method name and SubMsg. 
    SubMsg will be executed to callback on reply 
    method with INSTANTIATE_REPLY_ID as identifier 
    to complete further operations */
    Ok(Response::new()
        .add_attribute("method", "instantiate_token")
        .add_submessage(sub_msg))
}

pub fn execute_featured(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    token: String,
    amount: Uint128
) -> Result<Response, ContractError> {
    

    let mut minted_tokens = MINTED_TOKENS.load(deps.storage).unwrap();

    let mut has_tokens = false;

    let mut iterator = minted_tokens.iter_mut();
    while let Some(element) = iterator.next() { 
        if element.token_contract.clone() == token {
            (*element).feature_cost += amount;
            has_tokens = true;
        }
    }

    if !has_tokens {
        return Err(ContractError::NotExistingToken {});
    }

    MINTED_TOKENS.save(deps.storage, &minted_tokens)?;
    
    Ok(Response::new()
        .add_attribute("method", "increase_featured"))
}

pub fn query_balance_of_factory_tokens (
    querier: &QuerierWrapper,
    address: String,
    token_contract_address: String
) -> Result<cw20::BalanceResponse, StdError> {
    let msg = Cw20QueryMsg::Balance { address };
    let request = QueryRequest::Wasm( cosmwasm_std::WasmQuery::Smart { 
        contract_addr: token_contract_address, 
        msg: to_binary(&msg).unwrap(),
    });
    querier.query(&request)
}

pub fn query_token_info (
    querier: &QuerierWrapper,
    token_contract_address: String
) -> Result<cw20::TokenInfoResponse, StdError> {
    let msg = Cw20QueryMsg::TokenInfo {};
    let request = QueryRequest::Wasm( cosmwasm_std::WasmQuery::Smart { 
        contract_addr: token_contract_address, 
        msg: to_binary(&msg).unwrap(),
    });
    querier.query(&request)
}

pub fn execute_withdraw(
    deps: DepsMut,
    info: MessageInfo,
    amount: Option<Uint128>
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    /* Amount of tokens to be burned mLUNA not be zero */
    if config.admin_address.clone() != info.sender.to_string() {
        return Err(ContractError::Unauthorized {  } );
    }
 
    let balance_result = query_balance_of_factory_tokens(
        &deps.querier, config.admin_address.clone(), config.native_factory_token_address.clone());
    if balance_result.is_err() {
        return Err(ContractError::InvalidInput {  });
    }

    let balance = balance_result.ok().unwrap();
    if  balance.balance.is_zero()  {
        return Err(ContractError::NotAllowZeroAmount {  });
    }
    
    let sub_msg = SubMsg::new(WasmMsg::Execute {
        contract_addr: config.native_factory_token_address.clone(),
        msg: to_binary(&cw20_base::msg::ExecuteMsg::Transfer { recipient: info.sender.to_string(), amount: amount.unwrap_or(balance.balance) } )?,
        funds: vec![],
    });

    
    Ok(Response::new()
        .add_attribute("method", "withdraw")
        .add_submessages(vec![sub_msg]))
}

pub fn execute_import(
    deps: DepsMut,
    info: MessageInfo,
    contract: String
) -> Result<Response, ContractError> {
    
    let token_info_response = query_token_info(
        &deps.querier, contract.clone());
    if token_info_response.is_err() {
        return Err(ContractError::NotExistingToken {  });
    }

    let mut has_tokens  = false;
    
    /* Add all initial token supply */
    MINTED_TOKENS.load(deps.storage).unwrap()
        .iter()
        .for_each(|t| if t.token_contract.clone() == contract { has_tokens=true; });

    if has_tokens {
        return Err(ContractError::AlreadyExistingToken {  });
    }

    let _token_info = token_info_response.ok().unwrap();
    let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
    
    MINTED_TOKENS.update(deps.storage, |mut tokens| -> StdResult<Vec<TokenData>> {
        tokens.push(TokenData { 
            token_contract: contract.to_string(), 
            feature_cost: Uint128::new(0), 
            visible: true,
            timestamp
         } );
        Ok(tokens)
    })?;
    
    
    Ok(Response::new()
        .add_attribute("method", "import"))
}

pub fn execute_update_service_info(
    deps: DepsMut,
    info: MessageInfo,
    service_fee: Uint128,
    dist_percent: u128, 
    dist_address: String,
    admin_address: String
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    /* Amount of tokens to be burned mLUNA not be zero */
    if service_fee.is_zero() {
        return Err(ContractError::NotAllowZeroAmount {});
    }

    if dist_percent >= 100 {
        return Err(ContractError::InvalidInput {});
    }

    if info.sender.clone() != config.admin_address  {
        return Err(ContractError::InvalidInput {});
    }
    
    CONFIG.update(deps.storage, |mut exists| -> StdResult<_> {
        exists.service_fee = service_fee;
        exists.dist_address = dist_address;
        exists.dist_percent = dist_percent;
        exists.admin_address = admin_address;
        Ok(exists)
    })?;

    
    Ok(Response::new().add_attribute("action", "update_service_fee"))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn reply(deps: DepsMut, _env: Env, msg: Reply) -> StdResult<Response> {
    match msg.id {
        INSTANTIATE_REPLY_ID => handle_instantiate_reply(deps, msg),
        id => Err(StdError::generic_err(format!("Unknown reply id: {}", id))),
    }
}

fn handle_instantiate_reply(deps: DepsMut, msg: Reply) -> StdResult<Response> {
    let result = msg.result.into_result().map_err(StdError::generic_err)?;

    /* Find the event type instantiate_contract which contains the contract_address*/
    let event = result
        .events
        .iter()
        .find(|event| event.ty == "instantiate")
        .ok_or_else(|| StdError::generic_err("cannot find `instantiate_contract` event"))?;

    /* Find the contract_address from instantiate_contract event*/
    let contract_address = &event
        .attributes
        .iter()
        .find(|attr| attr.key == "_contract_address")
        .ok_or_else(|| StdError::generic_err("cannot find `contract_address` attribute"))?
        .value;
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();
    /* Update the state of the contract adding the new generated MINTED_TOKEN */
    MINTED_TOKENS.update(deps.storage, |mut tokens| -> StdResult<Vec<TokenData>> {
        tokens.push(TokenData { 
            token_contract: contract_address.to_string(), 
            feature_cost: Uint128::new(0), 
            visible: true,
            timestamp
        } );
        Ok(tokens)
    })?;

    Ok(Response::new()
        .add_attribute("method", "handle_instantiate_reply")
        .add_attribute("contract_address", contract_address))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        /* Return the list of all tokens that were minted thru this contract */
        QueryMsg::GetMintedTokens {} => to_binary(&query_minted_tokens(deps)?),
        QueryMsg::GetServiceInfo {} => to_binary(&query_service_info(deps)?),
        QueryMsg::GetFactoryTokenBalance{} => to_binary(&query_factory_token_balance(deps, _env)?)
    }
}

fn query_minted_tokens(deps: Deps) -> StdResult<MintedTokens> {
    Ok(MintedTokens {
        minted_tokens: MINTED_TOKENS.load(deps.storage)?,
    })
}

fn query_service_info(deps: Deps) -> StdResult<ServiceInfo> {
    let config = CONFIG.load(deps.storage)?;
    Ok(ServiceInfo {
        service_fee: config.service_fee,
        dist_percent: config.dist_percent,
        dist_address: config.dist_address,
        admin_address: config.admin_address

    })
}

fn query_factory_token_balance(deps: Deps, env: Env) -> StdResult<FactoryTokenBalance> {
    let config = CONFIG.load(deps.storage)?;
    let balance_result = query_balance_of_factory_tokens(
        &deps.querier, env.contract.address.to_string(), config.native_factory_token_address.clone());
    let mut balance = Uint128::new(0u128);
    if balance_result.is_ok() {
        balance = balance_result.ok().unwrap().balance;
    }

    Ok(FactoryTokenBalance { balance })
}


/* In case you want to upgrade this contract you can find information about
how to migrate the contract in the following link:
https://docs.terra.money/docs/develop/dapp/quick-start/contract-migration.html*/
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(_deps: DepsMut, _env: Env, _msg: MigrateMsg) -> StdResult<Response> {
    Ok(Response::default())
}

