import { useEffect, useState } from 'react'
import { ConnectedWallet, useConnectedWallet, useWallet, WalletStatus } from '@terra-money/wallet-provider';
import Loader from './../components/Loader';
import TokenDashboard from './../components/TokenDashboard';
import TokenHoldersList from './../components/TokenHoldersList';
import TokenDialog, { CloseType, SubmitTokenData, TokenPropsType } from './../components/TokenDialog';
import TokenHeader from './../components/TokenHeader';
import { useNavigate, useParams } from 'react-router-dom';
import { getAccountBalance, getLeaderboard, getMintedTokens, getTokenAccountsWithBalance, getTokenInfo, getTokenOverallInfo } from '../contract/query';
import { Address } from '../models/address';
import * as execute from "./../contract/execute";
import { TokenData, TokenHolder, TokenOverallInfo, TokenRanking } from '../models/query';
import { useSnackbar } from "notistack";

import {ScorePieChart} from "./../components/ScorePieChart"
import VoteTokenDialog from "./../components/VoteTokenDialog"
import TokensTable from '../components/TokensTable';
import { Button, Grid } from '@mui/material';
import { TokenUtils } from '../models/token';
import { lptokenAddress } from '../contract/address';
import { AddCircle } from '@mui/icons-material';

function Dashboard() {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [tokens, setTokens] = useState(new Array<TokenOverallInfo>())
    const [lpBalance, setLpBalance] = useState(0)
    const [topTokens, setTopTokens] = useState(new Array<TokenRanking>())
    const connectedWallet = useConnectedWallet() as ConnectedWallet
    const wallet = useWallet()
    const navigate = useNavigate();
    const fetchData = async () => {
        if (connectedWallet) 
        {
            setLoading(true);
            try {
                const tokensInfo = await getMintedTokens(connectedWallet);

                let filtereedTokens = tokensInfo.minted_tokens.filter(
                    token=> token.visible && token.token_issuer == connectedWallet.walletAddress);
                // let max_of_issuer = Number(tokensInfo.max_of_issuer || 0);
                // let max_of_member = Number(tokensInfo.max_of_member || 0);
                
                const tokensPromises = filtereedTokens.map(tokenInfo=>{
                    return getTokenInfo(tokenInfo.token_contract, connectedWallet);
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


                const leaderboardResponse = await getLeaderboard();

                for ( let i = 0 ; i < leaderboardResponse.tokens.length; i++ ) {
                    const info = await getTokenInfo(leaderboardResponse.tokens[i].token, connectedWallet);
                    leaderboardResponse.tokens[i].name = info.name;
                    leaderboardResponse.tokens[i].symbol = info.symbol;
                }

                setTopTokens(leaderboardResponse.tokens);

                const lpbalance = await getAccountBalance(lptokenAddress(), connectedWallet.walletAddress);
                setLpBalance(lpbalance);
            } catch (err) {
                console.log(err);
            }

            setLoading(false);
        }
        // else {
        //     setLoading(true);
        // }
    }

    useEffect(() => {
        fetchData()
    }, [connectedWallet]);

    const onRowClick = (address: Address) => navigate(`/tokens/${address}/update`);
    const onRowFeatured = async (address: Address) => {
        setLoading(true);
        try {
            await execute.featureToken(address, wallet, connectedWallet);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);

        await fetchData();
    }

    const onProvideLP = () => {
        window.open('https://app-classic.terraswap.io/swap?type=provide&from=uluna&to=terra132xampf3efc4ct8952jy9u93cqvrhmfr46r3j62zvl9486d27mgs55kfhf');
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    return (
        <div className="Dashboard">
            {loading && <Loader />}
            <h2>Token Dashboard</h2>
            <h3>Token List</h3>
            <TokensTable tokens={tokens}
                loading={loading}
                fullpage={true}
                onRowClick={onRowClick} 
                onRowFeatured={onRowFeatured}/>
            <h3>Current Leaderboard</h3>
            <Grid container columnSpacing={isMobile?1:4} rowSpacing={1} marginTop="0.5em"  marginBottom="2em">
            {topTokens.map((token, index) => (
                <>
                <Grid item xs={8}>
                    <div className='LeaderboardToken'>
                        {token.name ? token.name + " / " + token.symbol : "/"}
                    </div>
                </Grid>
                <Grid item xs={4}>
                    <div className='LeaderboardToken'>
                        {(Number(token.amount_of_issuer) / (10**6)) + " uLPs" }
                    </div>
                </Grid>
                
                </>
            ))}

            </Grid>
            <div className='ProvideLP'>
               <span> You have </span> {(Number(lpBalance) / (10**6))} <span>uLPs</span>
               {/* <span> You have </span> {lpBalance.toFixed(3)} <span>uLPs</span> */}

               <Button id="ProvideLPButton"
                    variant="outlined"
                    onClick={onProvideLP}>
                    
                    <AddCircle fontSize="inherit" />
                    <span>Add Liquidity</span>
                </Button>
            </div>
        </div>
    )
}
export default Dashboard
