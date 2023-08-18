import { LCDClient } from '@terra-money/terra.js'
import { ConnectedWallet } from '@terra-money/wallet-provider'
import { factoryAddress, networkLCD, chainID  } from './address'
import { AllAccountsResponse, BalanceResponse, LeaderBoardResponse, MarketingResponse, MintedTokensResponse, MinterResponse, ServiceInfoResponse, TokenData, TokenFeature, TokenInfoResponse, TokenOverallInfo } from '../models/query';
import { Address} from '../models/address';


export const getMintedTokens = async (wallet: ConnectedWallet): Promise<MintedTokensResponse> => {
    const lcd = new LCDClient({
        URL: networkLCD,
        chainID: chainID,
    })
    return lcd.wasm.contractQuery(factoryAddress(), { get_minted_tokens: {} })
}

export const getServiceInfo = async (wallet: ConnectedWallet): Promise<ServiceInfoResponse> => {
    const lcd = new LCDClient({
        URL: networkLCD,
        chainID,
    })
    return lcd.wasm.contractQuery(factoryAddress(), { get_service_info: {} })
}

export const getLeaderboard = async (): Promise<LeaderBoardResponse> => {
    const lcd = new LCDClient({
        URL: networkLCD,
        chainID,
    })
    return lcd.wasm.contractQuery(factoryAddress(), { get_leaderboard: {count:"3"} })
}


export const getTokenOverallInfo = async (tokenAddress: Address, wallet: ConnectedWallet, lcd?: LCDClient): Promise<TokenOverallInfo> => {
    if (!lcd) {
        lcd = new LCDClient({
            URL: networkLCD,
            chainID,
        });
    }

    let tokenData: TokenData = {
        address: tokenAddress
    };

    try {
        let queryTokenInfo: TokenInfoResponse = await lcd.wasm.contractQuery(tokenAddress, {
            token_info: {}
        });
        tokenData = {
            ...tokenData,
            ...queryTokenInfo
        }
    }
    catch (e) {
        console.error(e);
    }

    try {
        let marketingInfo: MarketingResponse = await lcd.wasm.contractQuery(tokenAddress, {
            marketing_info: {}
        });
        tokenData = {
            ...tokenData,
            ...marketingInfo
        }
    } catch (e) {
        console.error(e);
    }

    try {
        let tokenFeature: TokenFeature = await lcd.wasm.contractQuery(factoryAddress(), {
            get_token_feature_info: {
                token: tokenAddress
            }
        });

        return {
            token_data: tokenData,
            token_feature: tokenFeature
        }
    } catch (e) {
        console.error(e);
    }

    return {};
}

export const getTokenInfo = async (tokenAddress: Address, wallet: ConnectedWallet, lcd?: LCDClient): Promise<TokenData> => {
    if (!lcd) {
        lcd = new LCDClient({
            URL: networkLCD,
            chainID,
        });
    }

    let tokenData: TokenData = {
        address: tokenAddress
    };

    try {
        let queryTokenInfo: TokenInfoResponse = await lcd.wasm.contractQuery(tokenAddress, {
            token_info: {}
        });
        tokenData = {
            ...tokenData,
            ...queryTokenInfo
        }
    }
    catch (e) {
        console.error(e);
    }

    try {
        let marketingInfo: MarketingResponse = await lcd.wasm.contractQuery(tokenAddress, {
            marketing_info: {}
        });
        tokenData = {
            ...tokenData,
            ...marketingInfo
        }
    } catch (e) {
        console.error(e);
    }

    try {
        let res: MinterResponse = await lcd.wasm.contractQuery(tokenAddress, {
            minter: {}
        });
        tokenData = {
            ...tokenData,
            ...res
        }
    } catch (e) {
        console.error(e);
    }

    return tokenData;
}

// export const getTokenData = async (tokenAddress: Address, wallet: ConnectedWallet): Promise<TokenData> => {
//     const lcd = new LCDClient({
//         URL: networkLCD,
//         chainID,
//     });
//     let tokenData: TokenData = await getTokenInfo(tokenAddress, wallet, lcd);

//     try {
//         let res: MinterResponse = await lcd.wasm.contractQuery(tokenAddress, {
//             minter: {}
//         });
//         tokenData = {
//             ...tokenData,
//             ...res
//         }
//     } catch (e) {
//         console.error(e);
//     }

//     return tokenData;
// }

export const getTokenAccountsWithBalance = async (tokenAddress: Address, wallet: ConnectedWallet): Promise<Array<{balance:number, address: Address}>> => {
    const lcd = new LCDClient({
        URL: networkLCD,
        chainID,
    });

    let result = new Array();
    let start_after:string = "";
    


    while ( true ) {
        let res: AllAccountsResponse = await lcd.wasm.contractQuery(tokenAddress, {
            all_accounts: {start_after: start_after || undefined, limit:30}
        });

        if (res.accounts && res.accounts.length > 0) {
       
            const balancePromises = !start_after ? res.accounts.slice(0,10).map(account => {
                return getAccountBalance(tokenAddress, account);
            }) : [];
            const balances = await Promise.all(balancePromises);

            const accountsWithBalances = res.accounts.map((account,index) =>{
                return {
                    address: res.accounts[index],
                    balance: index < balances.length ? balances[index]: -1,

                }
            });

            result.push(...accountsWithBalances);
            start_after = accountsWithBalances.at(-1)?.address || "";
        }
        else return result;
    }
}

export const getAccountBalance = async (tokenAddress: Address, address: Address): Promise<number> => {
    const lcd = new LCDClient({
        URL: networkLCD,
        chainID,
    });

    try {
        let res = await lcd.wasm.contractQuery(tokenAddress, {
            balance: { address }
        }) as { balance: string };

        return Number(res.balance);
    } catch (e) {
        console.error(e);
        return 0;
    }
}

export const getFactoryTokenBalance =  (): Promise<BalanceResponse> => {
    const lcd = new LCDClient({
        URL: networkLCD,
        chainID,
    })
    return lcd.wasm.contractQuery(factoryAddress(), { get_factory_token_balance: {} })
}
