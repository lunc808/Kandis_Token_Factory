import * as query from '../contract/query';
import * as execute from '../contract/execute';
import { useEffect, useState } from 'react'
import { Button } from '@mui/material';
import { ConnectedWallet, useConnectedWallet, useWallet, WalletStatus } from '@terra-money/wallet-provider';
import { TokenData, TokenInfo, TokenOverallInfo } from '../models/query';
import TokensTable from './../components/TokensTable';
import { Address } from '../models/address';
import { useNavigate } from 'react-router-dom';
import TokensListHeader from './TokensListHeader';
import CreateTokenHeader from './CreateTokenHeader';
import ImportTokenHeader from './ImportTokenHeader';
import ImportTokenDialog from '../components/ImportTokenDialog';
import { useSnackbar } from 'notistack';


function Tokens() {
    const { enqueueSnackbar } = useSnackbar();
    const [tokens, setTokens] = useState(new Array<TokenOverallInfo>())
    const [loading, setLoading] = useState(true);
    const [showImport, setShowImport] = useState(false);
    const connectedWallet = useConnectedWallet() as ConnectedWallet
    const wallet = useWallet()
    const navigate = useNavigate();

    useEffect(() => {
        const preFetch = async () => {
            // if (status === WalletStatus.WALLET_CONNECTED) 
            {
                const tokensInfo = await query.getMintedTokens(connectedWallet);
                

                let filtereedTokens = tokensInfo.minted_tokens.filter(token=> token.visible);
                // let max_of_issuer = Number(tokensInfo.max_of_issuer || 0);
                // let max_of_member = Number(tokensInfo.max_of_member || 0);
                
                const tokensPromises = filtereedTokens.map(tokenInfo=>{
                    return query.getTokenInfo(tokenInfo.token_contract, connectedWallet);
                });
                

                let tokenInfos = await Promise.all(tokensPromises);

                let tokens:TokenOverallInfo[] = tokenInfos.map((token, index) => {
                    return {
                        token_data: {
                            ...token,
                            total_supply: Number(token.total_supply)
                        },
                        token_feature: {
                            ...filtereedTokens[index],
                            max_of_issuer: tokensInfo.max_of_issuer,
                            max_of_member: tokensInfo.max_of_member

                        }
                    }
                });

                setTokens(tokens);
                setLoading(false);
            }
            // else {
            //     setLoading(true);
            // }
        }
        preFetch()
    }, [status, connectedWallet]);

    const onImportToken = async (token: string): Promise<any> => {
        setLoading(true);
        setShowImport(false);
        try {
            if ( token )
            {
                const newTokenResponse = await execute.importToken(token, wallet, connectedWallet);
                enqueueSnackbar(`Token successfully imported`, {variant: "success"});
                navigate(`/tokens/${token}`);
            }
        }
        catch(e) {
          console.log(e);
          enqueueSnackbar(`Failed to import token.Check the token address is valid.`, {variant: "error"});
        }
        setLoading(false);
    }

    const showImportDialog = () => {
        setShowImport(true);
    }    

    const onRowClick = (address: Address) => navigate(`/tokens/${address}`);

    return (
        <div className="Tokens">
            {showImport && <ImportTokenDialog onImportToken={onImportToken}></ImportTokenDialog>}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <TokensListHeader />
                <div>
                    {connectedWallet && <Button disableRipple style={{ backgroundImage: "none", backgroundColor: "transparent" }}
                        onClick={() => { setShowImport(true); }}>
                        <ImportTokenHeader />
                    </Button>}

                    {connectedWallet && <Button disableRipple style={{ backgroundImage: "none", backgroundColor: "transparent" }}
                        onClick={() => { navigate("/create-token"); }}>
                        <CreateTokenHeader />
                    </Button>}
                </div>
            </div>
            <TokensTable tokens={tokens}
                loading={loading}
                onRowClick={onRowClick} />
        </div>
    )
}
export default Tokens
