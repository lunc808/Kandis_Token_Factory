import { Address } from "./address"

export interface MintedTokensResponse {
    minted_tokens: Array<TokenInfo>,
    max_of_issuer: string,
    max_of_member: string
}

export interface TokenInfo {
    token_contract: string,
    token_issuer: string,
    visible: boolean,
    is_imported: boolean,
    amount_of_issuer: string,
    amount_of_member: string
}

export interface ServiceInfoResponse {
    service_fee: string,
    dist_percent: number,
    dist_address: string,
    admin_address: string
}


export interface BalanceResponse {
    balance: string
}

export interface TokenInfoResponse {
    name: string,
    symbol: string,
    decimals: number,
    total_supply: string
}

export interface MarketingResponse {
    description?: string,
    logo?: { url?: string},
    project?: string,
}

export interface MinterResponse {
    minter: string,
    cap?: string
}

export interface AllAccountsResponse {
    accounts: Array<Address>
}

export interface TokenRanking {
    token: string,
    amount_of_issuer: string,
    name?: string | null | undefined,
    symbol?: string | null | undefined
}

export interface LeaderBoardResponse {
    tokens: Array<TokenRanking>
}

export interface TokenData {
    address?: Address,
    name?: string,
    symbol?: string,
    decimals?: number,
    total_supply?: string | number,
    marketing?: string,
    description?: string,
    cap?: string,
    logo?: { url?: string},
    project?: string,
}

export interface TokenFeature {
    token_contract: string,
    token_issuer: string,
    visible: boolean,
    is_imported: boolean,
    amount_of_issuer: string,
    amount_of_member: string,
    max_of_issuer: string,
    max_of_member: string
}

export interface TokenOverallInfo {
    token_data?: TokenData,
    token_feature?: TokenFeature
}



export interface TokenHolder {
    address: Address, 
    balance: number
}
