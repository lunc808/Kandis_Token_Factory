import { AccAddress } from "@terra-money/terra.js"
import { TokenFeature } from "./query";

export interface Token {
    name: string,
    symbol: string,
    decimals: number,
    initial_balances: Array<InitialBalances>,
    mint?: Mint,
    marketing?: MarketingInfo;
}

export interface InitialBalances {
    amount: string,
    address: AccAddress
}

export interface Mint {
    minter: AccAddress | null,
    cap: string
}

export interface MarketingInfo {
    project?: string,
    description?: string,
    marketing?: string,
    logo?: MarketingLogo,
}

export interface MarketingLogo {
    url: string,
    embedded?: string
}

export class TokenUtils {
    static getBalanceString = (balance : Number | string, decimals? : number ) : string => {
        let v = (Number(balance) / (10**(decimals == undefined ?  6 : decimals))).toFixed(2);
        while ( v.endsWith("0")) {
            v = v.substring(0, v.length - 1);
        }
        if ( v.endsWith(".")) {
            return v.substring(0, v.length - 1);
        }
        return v;
    }

    static fromTokenData = (tokenData : TokenData, dist_address: String) : Token => {
        const clonedTokenData = {...tokenData};//Object.assign({}, tokenData);
        let token : Token = {
            name: clonedTokenData.name,
            symbol: clonedTokenData.symbol,
            decimals: Number(clonedTokenData.decimals),
            initial_balances: clonedTokenData.initial_balances.map((obj, index) => {
                let ib = {...obj};

                let amount = Number(clonedTokenData.cap) * Number(ib.amount) * (10 ** Number(clonedTokenData.decimals - 2));
                ib.amount = amount.toString();

                if ( index == clonedTokenData.initial_balances.length - 1) {
                    ib.amount = "0";
                }
                return ib;
            }),
            mint: {                
                minter: clonedTokenData.minter,
                cap: (Number(clonedTokenData.cap) * (10 ** Number(clonedTokenData.decimals))).toString()
            },
            marketing: {
                marketing: clonedTokenData.minter || "",
                project: clonedTokenData.project || "",
                description: clonedTokenData.description  || "",
                logo: {
                    url: clonedTokenData.logo || ""
                }
            }
        }
        
        // if(clonedTokenData.project) {
        //     token.marketing = {
        //         project : clonedTokenData.project
        //     }
        // }

        // if(clonedTokenData.description) {
        //     token.marketing = {
        //         ...token.marketing,
        //         description : clonedTokenData.description
        //     }
        // }
        
        // if(clonedTokenData.logo) {
        //     token.marketing = {
        //         ...token.marketing,
        //         logo: {
        //             url : clonedTokenData.logo
        //         }
        //     }
        // }
        return token;
    }

    static getInitialBalance = (token: Token): number => {
        let initialBalance = 0;

        token.initial_balances.forEach(ib => {
            initialBalance = initialBalance + Number(ib.amount);
        });

        return initialBalance;
    }

    static getIssuerScore = (token: TokenFeature ): number => {
        const maxValue = Number(token.max_of_issuer || 0);
        const amount = Number(token.amount_of_issuer || 0);
        return maxValue > 0 ? amount * 50 / maxValue : 0;
    }

    static getMemberScore = (token: TokenFeature ): number => {
        const maxValue = Number(token.max_of_member || 0);
        const amount = Number(token.amount_of_member || 0);
        return maxValue > 0 ? amount * 50 / maxValue : 0;
    }

    static getTotalScore = (token?: TokenFeature ): number => {
        if ( !token ) {
            return 0;
        }
        return this.getIssuerScore(token) + this.getMemberScore(token);
    }
}

export interface TokenData {
    name: string;
    symbol: string;
    decimals: number;
    initial_balances: Array<InitialBalances>;
    minter: string;
    cap: number;
    project: string,
    description: string,
    logo: string,
}