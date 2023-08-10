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

    /*
     * HELPER METHODS TO DO NOT REPEAT CODE MANY TIMES
     */

    fn do_instantiate(deps: DepsMut) -> Response {
        let instantiate_msg = InstantiateMsg {
            token_contract_code_id: 1,
            native_factory_token_address: "123123123".to_string(),
            service_fee: None,
            min_feature_cost: None,
            dist_percent: None,
            dist_address: None, 
            admin_address: None, 
        };
        let info = mock_info("creator", &[]);
        let env = mock_env();

        instantiate(deps, env, info, instantiate_msg).unwrap()
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
