use cosmwasm_std::{StdError, Uint128};
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("NotReceivedFunds")]
    NotReceivedFunds {},

    #[error("NotAllowZeroAmount")]
    NotAllowZeroAmount {},

    #[error("NotExistingToken")]
    NotExistingToken { 
    },

    #[error("AlreadyExistingToken")]
    AlreadyExistingToken { 
    },

    #[error("InvalidMaxSupply")]
    InvalidMaxSupply {},

    #[error("InvalidInput")]
    InvalidInput {},

    #[error("Not Native Factory Token")]
    UnacceptableToken {},

    #[error("NotAllowedMultipleDenoms")]
    NotAllowedMultipleDenoms {},

    #[error("TokenAddressMustBeWhitelisted")]
    TokenAddressMustBeWhitelisted {},

    #[error("ReceivedFundsMismatchWithMintAmount")]
    ReceivedFundsMismatchWithMintAmount {
        received_amount: Uint128,
        expected_amount: Uint128
    },

    #[error("ReceivedFundsLessThanMinFeaturedCost")]
    ReceivedFundsLessThanMinFeaturedCost {
        received_amount: Uint128,
        min_amount: Uint128
    },
}
