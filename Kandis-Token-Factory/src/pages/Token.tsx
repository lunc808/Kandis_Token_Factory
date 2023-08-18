import { useEffect, useState } from 'react'
import { ConnectedWallet, useConnectedWallet, useWallet, WalletStatus } from '@terra-money/wallet-provider';
import Loader from './../components/Loader';
import TokenDashboard from './../components/TokenDashboard';
import TokenHoldersList from './../components/TokenHoldersList';
import TokenDialog, { CloseType, SubmitTokenData, TokenPropsType } from './../components/TokenDialog';
import TokenHeader from './../components/TokenHeader';
import { useParams } from 'react-router-dom';
import { getAccountBalance, getTokenAccountsWithBalance, getTokenInfo, getTokenOverallInfo } from '../contract/query';
import { Address } from '../models/address';
import * as execute from "./../contract/execute";
import { TokenData, TokenHolder, TokenOverallInfo } from '../models/query';
import { useSnackbar } from "notistack";

import {ScorePieChart} from "./../components/ScorePieChart"
import VoteTokenDialog from "./../components/VoteTokenDialog"

function Token() {
    const { enqueueSnackbar } = useSnackbar();
    const [initializing, setInitializing] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingTokeHolders, setLoadingTokeHolders] = useState(true);
    const [showVoteDialog, setShowVoteDialog] = useState(false);
    const [dialogType, setDialogType] = useState(null as TokenPropsType);
    const [tokenData, setTokenData] = useState({} as TokenData);
    const [tokenHolders, setTokenHolders] = useState({ holders: Array<TokenHolder>() });
    const [walletHoldings, setWalletHoldings] = useState(0);
    const [tokenOverallInfo, setTokenOverallInfo] = useState({} as TokenOverallInfo);

    let { id } = useParams();

    const connectedWallet = useConnectedWallet() as ConnectedWallet
    const wallet = useWallet()

    useEffect(() => {
        fetchData(true)
    }, [wallet, connectedWallet])

    const fetchData = async (shouldAll: boolean) => {
        // if (wallet.status === WalletStatus.WALLET_CONNECTED) 
        if ( (!loading && !loadingTokeHolders) || initializing )
        {
            try {

                let tokenOverallInfo = await getTokenOverallInfo(id as string, connectedWallet);
                setTokenOverallInfo(tokenOverallInfo);

                if ( shouldAll ) {
                    setInitializing(false);
                    const tokenData = await getTokenInfo(id as Address, connectedWallet);
                    setLoading(false);
                    setTokenData(tokenData);

                    setLoadingTokeHolders(true);
                    const holders = await getTokenAccountsWithBalance(id as Address, connectedWallet);
                    const holding = holders.find(holding => connectedWallet && holding.address === connectedWallet.terraAddress);
                    // if(holding && tokenData.decimals){
                    //     setWalletHoldings(holding.balance / (10 ** tokenData.decimals))
                    // }
                    setTokenHolders({ holders });
                    setLoadingTokeHolders(false);
                }
            } catch (error) {
                console.log(error);
                setLoadingTokeHolders(false);
                setLoading(false);
            }
        }
        // else {
        //     setLoading(true)
        // }
    }

    const onEditToken = () => setDialogType("MINT");

    const onOpenVoteToken = () => setShowVoteDialog(true);

    const onSubmitData = async (closeType : CloseType, data: SubmitTokenData) => {
        try {
            if(closeType === 'SUBMIT'){
                setLoading(true);
                if(tokenData.address && data.address && data.amount) {
                    if(dialogType === "MINT") {
                        await execute.mintToken(
                            tokenData, 
                            data, 
                            wallet,
                            connectedWallet
                        );
                        enqueueSnackbar(`Tokens ${dialogType?.toLowerCase()}ed successfully`, {variant: "success"});
                    }
                    else {
                        await execute.burnToken(
                            tokenData, 
                            data, 
                            wallet,
                            connectedWallet
                        );
                        enqueueSnackbar(`Tokens ${dialogType?.toLowerCase()}ed successfully`, {variant: "success"});
                    }
                }
                fetchData(false);
            }
            
        }
        catch(e) {
            enqueueSnackbar(`${e}`, {variant: "error"});
        }

        setLoading(false);
        setDialogType(null);
    }

    const onPageChanged = async( page:number, count:number)=>{
        try {
            let {holders} = tokenHolders;
            
            for ( let i = page * count ; i < page * count + count && i < holders.length; i++ ) {
                if ( holders[i].balance < 0 ) {
                    holders[i].balance = await getAccountBalance(id as Address, holders[i].address);
                }
            }

            setTokenHolders({ holders });
            setLoadingTokeHolders(false);
        } catch (error) {
            console.log(error);
        }
    }

    const onVoteToken = async (amount: Number) => {
        setShowVoteDialog(false);
        if ( amount.valueOf() <= 0 ) {
            return;
        }
        setLoading(true);
        try {
            const newTokenResponse = await execute.voteToken(id as string, wallet, connectedWallet);
            enqueueSnackbar(`Successfully voted`, {variant: "success"});
        }
        catch(e) {
          console.log(e);
          enqueueSnackbar(`Failed to vote token. Check the token address is valid.`, {variant: "error"});
        }
        setLoading(false);
        fetchData(false);

    }

    return (
        <div className="Tokens">
            {loading && <Loader />}
            {showVoteDialog && <VoteTokenDialog onVoteToken={onVoteToken}/>}
            <TokenHeader
                onEditToken={() => onEditToken()}
                onOpenVoteToken={() => onOpenVoteToken()}
                isMyToken = {tokenOverallInfo.token_feature?.token_issuer == connectedWallet?.walletAddress} />
            <TokenDashboard token={tokenData} />
            <div>
                <ScorePieChart token={tokenOverallInfo.token_feature ? tokenOverallInfo.token_feature : undefined}/>
            </div>
            <TokenHoldersList holders={tokenHolders.holders}
                symbol={tokenData.symbol as string}
                decimals={Number(tokenData.decimals)}
                totalSupply={Number(tokenData.total_supply)}
                pageLoading={loading}
                loading={loadingTokeHolders} 
                onPageChanged={onPageChanged}/>
            <TokenDialog
                type={dialogType}
                symbol={tokenData.symbol}
                holdingAmount={walletHoldings}
                walletAddress={connectedWallet?.terraAddress}
                onSubmitData={onSubmitData} />
        </div>
    )
}
export default Token
