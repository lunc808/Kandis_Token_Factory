import { useEffect, useState } from 'react'
import { ConnectedWallet, useConnectedWallet, useWallet, WalletStatus } from '@terra-money/wallet-provider';
import Loader from './../components/Loader';
import { useNavigate, useParams } from 'react-router-dom';
import { getAccountBalance, getLeaderboard, getMintedTokens, getTokenAccountsWithBalance, getTokenInfo, getTokenOverallInfo } from '../contract/query';
import { Address } from '../models/address';
import * as execute from "./../contract/execute";
import { TokenData, TokenHolder, TokenOverallInfo, TokenRanking } from '../models/query';
import { useSnackbar } from "notistack";

import {ScorePieChart} from "./../components/ScorePieChart"
import VoteTokenDialog from "./../components/VoteTokenDialog"
import TokensTable from '../components/TokensTable';
import { Button, Grid, TextField, TextareaAutosize } from '@mui/material';
import { TokenUtils } from '../models/token';
import { lptokenAddress } from '../contract/address';
import { AddCircle } from '@mui/icons-material';

function TokenUpdate() {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [description, setDescription] = useState("");
    const [logo, setLogo] = useState("");
    const [title, setTitle] = useState("");
    const connectedWallet = useConnectedWallet() as ConnectedWallet
    const wallet = useWallet()
    const navigate = useNavigate();
    let { id } = useParams();

    const fetchData = async () => {
        if (connectedWallet) 
        {
            setLoading(true);
            const tokenInfo = await getTokenInfo(id as string, connectedWallet);
            setDescription(tokenInfo.description || "");
            setLogo(tokenInfo.logo?.url || "");
            setTitle(tokenInfo.name + " / " + tokenInfo.symbol);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData()
    }, [connectedWallet]);

    const onUpdateDescription = (e: any) => {
        setDescription(e.target.value);
    }

    const onUpdateLogo = (e: any) => {
        setLogo(e.target.value);
    }

    const onUpdate = async () => {
        setLoading(true);
        try {
            await execute.updateToken(id as string, description, logo, wallet, connectedWallet);
            enqueueSnackbar(`Updated  token info successfully`, {variant: "success"});
        } catch (err) {
            console.log(err);
            enqueueSnackbar(`Failed to update token info`, {variant: "error"});
        }
        setLoading(false);

        await fetchData();
    }


    return (
        <div className="TokenUpdate">
            {loading && <Loader />}
            <h2>Token Dashboard - {title}</h2>
            <Grid container columnSpacing={4} rowSpacing={1} marginTop="0.5em"  marginBottom="2em">
                <Grid item xs={12}>
                    <h3>Project Description</h3>
                </Grid>
                <Grid item xs={12} >
                    <div className='LeaderboardToken'>
                        <TextField fullWidth
                                id="description"
                                multiline
                                minRows={4}
                                className='InputField'
                                onChange={(event) => onUpdateDescription(event)}
                                value={description}/>
                    </div>
                </Grid>
                
                <Grid item xs={12} marginTop="2em">
                    <h3>Project Logo</h3>
                </Grid>
                <Grid item xs={12} >
                    <div className='LeaderboardToken'>
                        <TextField fullWidth
                                id="logo"
                                type="text"
                                className='InputField'
                                onChange={(event) => onUpdateLogo(event)}
                                value={logo}/>
                    </div>
                </Grid>
                
            </Grid>

            <div className='ProvideLP'>
               <Button  onClick={()=>onUpdate()} disableRipple>
                    <span>Update</span>
                </Button>
            </div>
            
        </div>
    )
}
export default TokenUpdate
