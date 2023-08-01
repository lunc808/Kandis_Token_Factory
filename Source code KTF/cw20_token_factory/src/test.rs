#[cfg(test)]
mod tests {
    use crate::{
        contract::{execute, instantiate, query, reply},
        msg::{DepositType, ExecuteMsg, InstantiateMsg, MintedTokens, QueryMsg},
    };
    use cosmwasm_std::{
        coins, from_binary,
        testing::{mock_dependencies, mock_env, mock_info},
        to_binary, Attribute, BankMsg, Coin, CosmosMsg, DepsMut, Event, Reply, Response, SubMsg,
        SubMsgResponse, Uint128, WasmMsg,
    };
    use cw20::{Cw20Coin, MinterResponse};

    #[test]
    fn test_instantiate() {
        // GIVEN
        let mut deps = mock_dependencies();

        // WHEN
        let res = do_instantiate(deps.as_mut());

        // THEN
        let attrs = res.attributes;
        assert_eq!(
            vec![
                Attribute {
                    key: "method".to_string(),
                    value: "instantiate".to_string()
                },
                Attribute {
                    key: "token_contract_code_id".to_string(),
                    value: "1".to_string()
                }
            ],
            attrs
        );
    }

    #[test]
    fn test_mint_token() {
        // GIVEN
        let mut deps = mock_dependencies();

        // WHEN
        do_instantiate(deps.as_mut());
        let res = do_mint_new_token(deps.as_mut());

        // THEN
        let res_attr = res.attributes;
        assert_eq!(1, res_attr.len());
        assert_eq!("instantiate_token", res_attr.get(0).unwrap().value);

        let res_message = res.messages;
        assert_eq!(1, res_message.len());
        let success_reply = SubMsg::reply_on_success(
            CosmosMsg::Wasm(WasmMsg::Instantiate {
                admin: Some("cosmos2contract".to_string()),
                code_id: 1,
                funds: vec![],
                msg: to_binary(&cw20_base::msg::InstantiateMsg {
                    name: "Bit Money".to_string(),
                    symbol: "BTM".to_string(),
                    decimals: 2,
                    mint: Some(MinterResponse {
                        minter: "cosmos2contract".to_string(),
                        cap: Some(Uint128::new(1234)),
                    }),
                    initial_balances: vec![Cw20Coin {
                        amount: Uint128::new(123),
                        address: "creator".to_string(),
                    }],
                    marketing: None,
                })
                .unwrap(),
                label: "Bit Money".to_string(),
            }),
            1,
        );
        assert_eq!(&success_reply, res_message.get(0).unwrap());
    }

    #[test]
    fn test_reply_instantiate_event() {
        // GIVEN
        let mut deps = mock_dependencies();
        let env = mock_env();
        let query_minted_tokens = QueryMsg::GetMintedTokens {};

        // WHEN
        do_instantiate(deps.as_mut());
        do_mint_new_token(deps.as_mut());
        let do_instantiate_res = do_reply_instantiate_event(deps.as_mut());
        let query_res = query(deps.as_ref(), env, query_minted_tokens).unwrap();
        let query_res: MintedTokens = from_binary(&query_res).unwrap();

        // THEN
        assert_eq!(
            Response::new()
                .add_attribute("method", "handle_instantiate_reply")
                .add_attribute("contract_address", "bit_money_contract_address"),
            do_instantiate_res
        );
        assert_eq!(
            MintedTokens {
                minted_tokens: vec!["bit_money_contract_address".to_string()]
            },
            query_res
        );
    }

    
    /*
     * HELPER METHODS TO DO NOT REPEAT CODE MANY TIMES
     */

    fn do_instantiate(deps: DepsMut) -> Response {
        let instantiate_msg = InstantiateMsg {
            stable_denom: "uluna".to_string(),
            token_contract_code_id: 1,
        };
        let info = mock_info("creator", &[]);
        let env = mock_env();

        instantiate(deps, env, info, instantiate_msg).unwrap()
    }

    fn do_mint_new_token(deps: DepsMut) -> Response {
        let env = mock_env();
        let info = mock_info(
            "i_am_the_sender",
            &vec![Coin {
                denom: "uluna".to_string(),
                amount: Uint128::new(123),
            }],
        );
        let token_msg = cw20_base::msg::InstantiateMsg {
            name: "Bit Money".to_string(),
            symbol: "BTM".to_string(),
            decimals: 2,
            mint: Some(MinterResponse {
                minter: "creator".to_string(),
                cap: Some(Uint128::new(1234)),
            }),
            initial_balances: vec![Cw20Coin {
                amount: Uint128::new(123),
                address: "creator".to_string(),
            }],
            marketing: None,
        };
        let msg = ExecuteMsg::Deposit(DepositType::Instantiate(token_msg.clone()));

        execute(deps, env.clone(), info.clone(), msg).unwrap()
    }

    /* Confirm reply event form instantiate method. That way
    the minted_tokens addresses can be whitelisted in factory.*/
    fn do_reply_instantiate_event(deps: DepsMut) -> Response {
        let env = mock_env();

        let event = Event::new("instantiate_contract")
            .add_attribute("creator", "token_factory_addr")
            .add_attribute("admin", "i_am_the_sender")
            .add_attribute("code_id", "1")
            .add_attribute("contract_address", "bit_money_contract_address");

        reply(
            deps,
            env,
            Reply {
                id: 1,
                result: cosmwasm_std::SubMsgResult::Ok(SubMsgResponse {
                    events: vec![event],
                    data: None,
                }),
            },
        )
        .unwrap()
    }
}
