#[cfg(test)]
mod tests {
    use crate::{
        contract::{instantiate, execute_instantiate_token},
        msg::InstantiateMsg
    };
    use cosmwasm_std::{
        testing::{mock_dependencies, mock_env, mock_info},
         Attribute, DepsMut, Response, Uint128,
    };
    use cw20::{Cw20Coin, MinterResponse};
    use cw20_base::msg::InstantiateMarketingInfo;

    #[test]
    fn test_instantiate_token() {
        // GIVEN
        let mut deps = mock_dependencies();

        // WHEN
        let _res = do_instantiate(deps.as_mut());

        let info = mock_info("creator", &[]);
        let env = mock_env();

        let _ = execute_instantiate_token(deps.as_mut(), env, info, "aaa".to_string(), cw20_base::msg::InstantiateMsg{
            name:"sss".to_string(),
            symbol:"ss".to_string(),
            decimals:6,
            initial_balances:vec![
            Cw20Coin {
                amount: Uint128::from(78400000000u128),
                address:"terra1gwzndny4e4xf7evm5kjva73fqedux5gfwdr0ta".to_string()
            },
            Cw20Coin{
                address:"terra1yqx43ej26lqxg8ceepwcl663l8dc6vznjzmgcy".to_string(),
                amount:Uint128::from(0u128)
            }
            ],
            mint:Some(MinterResponse{
                minter:"terra1gwzndny4e4xf7evm5kjva73fqedux5gfwdr0ta".to_string(),
                cap: Some(Uint128::from(80000000000u128))
            }),
            marketing:Some(InstantiateMarketingInfo{
                marketing:Some("terra1gwzndny4e4xf7evm5kjva73fqedux5gfwdr0ta".to_string()),
                logo:None,
                project: None,
                description: None,
            })
        });

    }

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
            lp_token_address: "3123123123".to_string(),
            service_fee: None,
            dist_percent: Some(2u128),
            dist_address: Some("terra1yqx43ej26lqxg8ceepwcl663l8dc6vznjzmgcy".to_string()), 
            admin_address: Some("terra1yqx43ej26lqxg8ceepwcl663l8dc6vznjzmgcy".to_string()), 
        };
        let info = mock_info("creator", &[]);
        let env = mock_env();

        instantiate(deps, env, info, instantiate_msg).unwrap()
    }

}
