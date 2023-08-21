use std::convert::TryInto;
use std::vec;

use crate::error::ContractError;
use crate::msg::{DepositType, ExecuteMsg, InstantiateMsg, MigrateMsg, MintedTokens, QueryMsg, ServiceInfo, FactoryTokenBalance, TokenFeatureInfo, TokenResponse, LeaderBoardResponse, TokenRanking};
use crate::state::{Config, CONFIG, MINTED_TOKENS, TokenData, PENDING_CREATOR, VOTED_TOKENS, VOTED_USERS, FEATURED_TOKENS, FEATURED_USERS};
#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{
    to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Reply,
    Response, StdError, StdResult, SubMsg, Uint128, WasmMsg, from_binary,  QueryRequest, QuerierWrapper, ContractInfoResponse,
};
use cw20::{
   Cw20QueryMsg, Cw20ReceiveMsg, Cw20Coin, TokenInfoResponse,
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

    if deps.api.addr_validate(&msg.native_factory_token_address).is_err() {
        return Err(ContractError::InvalidInput {  });
    }

    if deps.api.addr_validate(&msg.lp_token_address).is_err() {
        return Err(ContractError::InvalidInput {  });
    }

    if msg.admin_address.clone().is_some() && deps.api.addr_validate(&msg.admin_address.clone().unwrap()).is_err() {
        return Err(ContractError::InvalidInput {  });
    }

    if msg.dist_address.clone().is_some() && deps.api.addr_validate(&msg.dist_address.clone().unwrap()).is_err() {
        return Err(ContractError::InvalidInput {  });
    }

    let state = Config {
        token_contract_code_id: msg.token_contract_code_id,
        native_factory_token_address: msg.native_factory_token_address,
        lp_token_address: msg.lp_token_address,
        service_fee: msg.service_fee.unwrap_or(Uint128::new(20000000)),
        dist_address: msg.dist_address.unwrap_or(_info.sender.to_string()),
        dist_percent: msg.dist_percent.unwrap_or(2),
        admin_address: msg.admin_address.unwrap_or(_info.sender.to_string())
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
        ExecuteMsg::Withdraw { amount } => execute_withdraw(deps, info, amount),
        ExecuteMsg::ImportToken { token } => execute_import(deps, info, token),
        ExecuteMsg::UpdateVisible { token , visible} => execute_update_visible(deps, info, token, visible),
        ExecuteMsg::VoteToken { token } => execute_vote(deps, info, token),
        ExecuteMsg::FeatureToken { token } => execute_feature(deps, info, token),
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

    

    let msg: DepositType = from_binary(&wrapper.msg)?;
    match msg {
        DepositType::Instantiate(token_data) => {
            if info.sender.clone() != cfg.native_factory_token_address {
                return Err(ContractError::UnacceptableToken {});
            }

            if wrapper.amount.ne(&cfg.service_fee)  {
                return Err(ContractError::ReceivedFundsMismatchWithMintAmount {
                    received_amount: wrapper.amount,
                    expected_amount: cfg.service_fee,
                });
            }
            execute_instantiate_token(deps, env, info, wrapper.sender, token_data)
        },
    }
}


pub fn execute_instantiate_token(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    sender: String,
    mut token_data: cw20_base::msg::InstantiateMsg,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    
    /* If a minter exists replace the minter address with
    the token-factory address that way the minting is only
    allowed thru this smart contract. */
    let mut max_supply:Uint128 = Uint128::zero();

    token_data.mint = match token_data.mint {
        None => None,
        Some(mut e) => {
            e.minter = env.contract.address.to_string();
            max_supply = e.clone().cap.unwrap_or_default();
            Some(e)
        }
    };

    let mut expected_amount = Uint128::zero();

    if max_supply.is_zero() {
        return Err(ContractError::InvalidMaxSupply {});
    }
    
    /* Add all initial token supply */
    token_data
        .initial_balances
        .iter()
        .for_each(|t| expected_amount += t.amount);

    let token_dist = max_supply.multiply_ratio(Uint128::new(config.dist_percent), Uint128::new(100));

    if expected_amount.checked_add(token_dist.clone()).unwrap().gt(&max_supply) {
        return Err(ContractError::InvalidMaxSupply {});
    }

    let ballance_dist: Cw20Coin = Cw20Coin {
        amount: token_dist,
        address:  config.dist_address.clone(),
    };

    let mut new_token_data = token_data.clone();
    let mut duplicated = false;

    let mut iterator = new_token_data.initial_balances.iter_mut();
    while let Some(element) = iterator.next() { 
        if element.address.clone() == config.dist_address {
            (*element).amount += token_dist;
            duplicated = true;
        }
    }

    if !duplicated {        
        new_token_data.initial_balances.push(ballance_dist);
    } else {
        
    } 

    PENDING_CREATOR.save(deps.storage, &sender)?;

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

pub fn query_balance_of_tokens (
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

pub fn execute_withdraw(
    deps: DepsMut,
    info: MessageInfo,
    amount: Option<Uint128>
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    /* Amount of tokens to be burned mLUNA not be zero */
    if config.admin_address.clone() != info.sender.to_string(){
        return Err(ContractError::Unauthorized {  } );
    }
 
    let balance_result = query_balance_of_tokens(
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


pub fn query_token_info (
    querier: &QuerierWrapper,
    token_contract_address: String
) -> Result<String, StdError> {
    let msg = Cw20QueryMsg::TokenInfo {};
    let request = QueryRequest::Wasm( cosmwasm_std::WasmQuery::Smart { 
        contract_addr: token_contract_address.clone(), 
        msg: to_binary(&msg).unwrap(),
    });
    
    let token_response: Result<TokenInfoResponse, StdError> = querier.query(&request);

    if token_response.is_err() {
        return Err(StdError::generic_err("invalid token contract"));
    }

    let contract_info:Result<ContractInfoResponse, StdError> = querier.query(
        &QueryRequest::Wasm(
            cosmwasm_std::WasmQuery::ContractInfo { contract_addr: token_contract_address }
    ));

    if contract_info.is_err() {
        return Err(StdError::generic_err("invalid token contract"));
    }

    return Ok(contract_info?.creator);

}

pub fn execute_import(
    deps: DepsMut,
    _info: MessageInfo,
    contract: String
) -> Result<Response, ContractError> {
    let token_info_response = query_token_info(
        &deps.querier, contract.clone());
    if token_info_response.is_err() {
        return Err(ContractError::NotExistingToken {  });
    }
    let token_issuer = token_info_response.ok().unwrap();

    let mut has_tokens  = false;
    
    /* Add all initial token supply */
    MINTED_TOKENS.load(deps.storage).unwrap()
        .iter()
        .for_each(|t| if t.token_contract.clone() == contract { has_tokens=true; });

    if has_tokens {
        return Err(ContractError::AlreadyExistingToken {  });
    }

    
    MINTED_TOKENS.update(deps.storage, |mut tokens| -> StdResult<Vec<TokenData>> {
        tokens.push(TokenData { 
            token_contract: contract.to_string(), 
            token_issuer: token_issuer.to_string(),
            visible: true,
            is_imported: true,
         } );
        Ok(tokens)
    })?;
    
    
    Ok(Response::new()
        .add_attribute("method", "import"))
}

pub fn execute_vote(
    deps: DepsMut,
    info: MessageInfo,
    token: String
) -> Result<Response, ContractError> {

    let minted_tokens = MINTED_TOKENS.load(deps.storage).unwrap();
    let mut token_info:Option<TokenData> = None;
    let sender: String = info.sender.to_string();

    minted_tokens
        .iter()
        .for_each(|t| {
            if t.token_contract == token.clone() {
                token_info = Some(t.clone());
            }
        });

    if token_info.is_none() || token_info.unwrap().token_issuer == sender.clone() {
        return Err(ContractError::InvalidInput {  });
    }

    let last = VOTED_TOKENS.load(deps.storage, sender.clone());
    if last.is_ok() {
        // if this user voted the other token already, remove this user from that token's voters list.
        VOTED_USERS.update(
            deps.storage,
            last.unwrap(),
            |us: Option<Vec<String>>| -> StdResult<_> {
                let mut users = us.unwrap_or_default();
                let index = users.iter().position(|r| r.to_string() == sender.clone()).unwrap();
                users.remove(index);
                Ok(users)
            }
        )?;
    }

    VOTED_TOKENS.update(
        deps.storage,
        sender.clone(),
        | _: Option<String>| -> StdResult<_> {
            Ok(token.clone())
        },
    )?;

    VOTED_USERS.update(
        deps.storage,
        token.clone(),
        |us: Option<Vec<String>>| -> StdResult<_> {
            let mut users = us.unwrap_or_default();
            users.push(sender);
            Ok(users)
        }
    )?;

    Ok(Response::new()
        .add_attribute("method", "vote"))
}

pub fn execute_feature(
    deps: DepsMut,
    info: MessageInfo,
    token: String
) -> Result<Response, ContractError> {
    
    let minted_tokens = MINTED_TOKENS.load(deps.storage).unwrap();
    let mut token_info:Option<TokenData> = None;
    let sender: String = info.sender.to_string();

    minted_tokens
        .iter()
        .for_each(|t| {
            if t.token_contract == token.clone() {
                token_info = Some(t.clone());
            }
        });

    if token_info.is_none() || token_info.unwrap().token_issuer != sender.clone() {
        return Err(ContractError::InvalidInput {  });
    }

    let last = FEATURED_TOKENS.load(deps.storage, sender.clone());
    if last.is_ok() {
        FEATURED_USERS.remove(
            deps.storage,
            last.unwrap()
        );
    }

    FEATURED_TOKENS.update(
        deps.storage,
        sender.clone(),
        |_: Option<String>| -> StdResult<_> {
            Ok(token.clone())
        },
    )?;

    FEATURED_USERS.update(
        deps.storage,
        token,
        |_: Option<String>| -> StdResult<_> {
            Ok(sender)
        }
    )?;
    
    Ok(Response::new()
        .add_attribute("method", "vote"))
}


pub fn execute_update_visible(
    deps: DepsMut,
    info: MessageInfo,
    token: String,
    visible: bool
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    if config.admin_address != info.sender.to_string() {
        return Err(ContractError::Unauthorized {  });
    }
    
    let mut minted_tokens = MINTED_TOKENS.load(deps.storage).unwrap();

    let mut has_tokens = false;

    let mut iterator = minted_tokens.iter_mut();
    while let Some(element) = iterator.next() { 
        if element.token_contract.clone() == token {
            element.visible = visible;
            has_tokens = true;
        }
    }

    if !has_tokens {
        return Err(ContractError::NotExistingToken {});
    }

    MINTED_TOKENS.save(deps.storage, &minted_tokens)?;

    Ok(Response::new()
        .add_attribute("method", "udpate_visible"))
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

    if deps.api.addr_validate(&dist_address).is_err() {
        return Err(ContractError::InvalidInput {  });
    }

    if deps.api.addr_validate(&admin_address).is_err() {
        return Err(ContractError::InvalidInput {  });
    }

    if info.sender.clone() != config.admin_address{
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
    
    let pending_creator = PENDING_CREATOR.load(deps.storage).unwrap_or_default();

    /* Update the state of the contract adding the new generated MINTED_TOKEN */
    MINTED_TOKENS.update(deps.storage, |mut tokens| -> StdResult<Vec<TokenData>> {

        tokens.push(TokenData { 
            token_contract: contract_address.to_string(), 
            token_issuer: pending_creator,
            visible: true,
            is_imported: false,
        } );
        Ok(tokens)
    })?;

    PENDING_CREATOR.save(deps.storage, &"".to_string())?;

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
        QueryMsg::GetFactoryTokenBalance{} => to_binary(&query_factory_token_balance(deps, _env)?),
        QueryMsg::GetTokenFeatureInfo { token } => to_binary(&query_token_feature_info(deps, _env, token)?),
        QueryMsg::GetLeaderboard { count } => to_binary(&query_leaderboard(deps, count)?),
    }
}

fn get_token_response_from_token(deps:Deps, token: String) -> StdResult<(Uint128, Uint128)> {
    let config = CONFIG.load(deps.storage)?;
    let featured_user = FEATURED_USERS.load(deps.storage, token.clone());
    let mut amount_of_issuer = Uint128::zero();
    let mut amount_of_member = Uint128::zero();
    if featured_user.is_ok() {
        let balance_response = query_balance_of_tokens(
            &deps.querier, featured_user?, config.lp_token_address.clone());
        if balance_response.is_ok() {
            amount_of_issuer = balance_response?.balance;
        }
    }

    let users = VOTED_USERS.load(deps.storage, token);

    if users.is_ok() {
        users?.iter().for_each(|user|{
            let balance_response = query_balance_of_tokens(
                &deps.querier, user.to_string(), config.native_factory_token_address.clone());
            if balance_response.is_ok() {
                amount_of_member += balance_response.unwrap().balance;
            }   
        });
    }

    Ok((amount_of_issuer, amount_of_member))
}

fn query_minted_tokens(deps: Deps) -> StdResult<MintedTokens> {

    let minted_tokens = MINTED_TOKENS.load(deps.storage)?;
    let mut max_of_issuer = Uint128::zero();
    let mut max_of_member = Uint128::zero();
    let mut tokens:Vec<TokenResponse> = Vec::new();

    minted_tokens
        .iter()
        .for_each(|t| {

            let amount = get_token_response_from_token(deps,t.token_contract.clone()).unwrap();

            if amount.0.gt(&max_of_issuer) {
                max_of_issuer = amount.0.clone();
            }

            if amount.1.gt(&max_of_member) {
                max_of_member = amount.1.clone();
            }

            tokens.push(TokenResponse { 
                token_contract: t.token_contract.clone(), 
                token_issuer: t.token_issuer.clone(), 
                visible: t.visible.clone(), 
                is_imported: t.is_imported.clone(), 
                amount_of_issuer: amount.0,
                amount_of_member: amount.1  })
        });

    Ok(MintedTokens {
        minted_tokens: tokens,
        max_of_issuer,
        max_of_member
    })
}

fn query_leaderboard(deps: Deps, size: u128) -> StdResult<LeaderBoardResponse> {

    let minted_tokens = MINTED_TOKENS.load(deps.storage)?;
    let mut tokens:Vec<(String, Uint128)> = Vec::new();
    let mut token_rankings:Vec<TokenRanking> = Vec::new();
    let count:usize = size.try_into().unwrap();

    minted_tokens
        .iter()
        .for_each(|t| {
            let amount = get_token_response_from_token(deps,t.token_contract.clone()).unwrap();
            tokens.push((t.token_contract.clone(), amount.0));
        });

    tokens.sort_by(|a, b| b.1.cmp(&a.1));

    for i in 0..count {
        if i < tokens.len() {
            token_rankings.push(TokenRanking { token: tokens[i].0.to_string(), amount_of_issuer: tokens[i].1 });
        }
    }

    while token_rankings.len() < count {
        token_rankings.push(TokenRanking { token: "".to_string(), amount_of_issuer: Uint128::zero() });
    }

    Ok(LeaderBoardResponse{tokens: token_rankings})
    // Ok(LeaderBoardResponse { tokens: Vec::new() })
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
    let balance_result = query_balance_of_tokens(
        &deps.querier, env.contract.address.to_string(), config.native_factory_token_address.clone());
    let mut balance = Uint128::new(0u128);
    if balance_result.is_ok() {
        balance = balance_result.ok().unwrap().balance;
    }

    Ok(FactoryTokenBalance { balance })
}

fn query_token_feature_info(deps: Deps, _env: Env, token: String) -> StdResult<TokenFeatureInfo> {
    let minted_tokens = MINTED_TOKENS.load(deps.storage)?;
    let mut max_of_issuer = Uint128::zero();
    let mut max_of_member = Uint128::zero();
    let mut token_info:Option<TokenResponse> = None;

    minted_tokens
        .iter()
        .for_each(|t| {
            let amount = get_token_response_from_token(deps,t.token_contract.clone()).unwrap();

            if amount.0.gt(&max_of_issuer) {
                max_of_issuer = amount.0.clone();
            }

            if amount.1.gt(&max_of_member) {
                max_of_member = amount.1.clone();
            }

            if t.token_contract == token.clone() {
                token_info = Some(TokenResponse { 
                    token_contract: t.token_contract.clone(), 
                    token_issuer: t.token_issuer.clone(), 
                    visible: t.visible.clone(), 
                    is_imported: t.is_imported.clone(), 
                    amount_of_issuer: amount.0,
                    amount_of_member: amount.1  });
            }
        });

    if token_info.is_none() {
        return Err(StdError::generic_err("Invalid Token"));
    }

    Ok(TokenFeatureInfo { 
        token_contract: token_info.clone().unwrap().token_contract, 
        token_issuer: token_info.clone().unwrap().token_issuer, 
        visible: token_info.clone().unwrap().visible, 
        is_imported: token_info.clone().unwrap().is_imported, 
        amount_of_issuer: token_info.clone().unwrap().amount_of_issuer, 
        amount_of_member: token_info.clone().unwrap().amount_of_member, 
        max_of_issuer, 
        max_of_member })
}


/* In case you want to upgrade this contract you can find information about
how to migrate the contract in the following link:
https://docs.terra.money/docs/develop/dapp/quick-start/contract-migration.html*/
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(_deps: DepsMut, _env: Env, _msg: MigrateMsg) -> StdResult<Response> {
    Ok(Response::default())
}

