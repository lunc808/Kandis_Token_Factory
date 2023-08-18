import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,  Container, Checkbox, Input, TextField } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect, useState } from "react";
import { Address } from "../../models/address";
import Loader from "../Loader";
import "./VoteTokenDialog.scss";
import { CheckBoxRounded, CheckBoxSharp } from "@mui/icons-material";
import { getAccountBalance } from "../../contract/query";
import { lptokenAddress } from "../../contract/address";
import { ConnectedWallet, useConnectedWallet } from "@terra-money/wallet-provider";

type VoteTokenProps = {
    onVoteToken: (amount: Number)=> any;
};

function VoteTokenDialog(props: VoteTokenProps) {
    const [lpBalance, setLpBalance] = useState(0);
    const connectedWallet = useConnectedWallet() as ConnectedWallet

    useEffect(()=>{
        if ( connectedWallet ) {
            getAccountBalance(lptokenAddress(), connectedWallet.walletAddress).then(lpBalance=>{
                setLpBalance(lpBalance);
            }).catch(reason=>{
                console.log(reason);
            });
        }
    })

    const onClick = () => {
        props.onVoteToken(1);
    }

    const onClose = () => {
        props.onVoteToken(0);
    }

    return (
        <Dialog className="VoteTokenDialog" open={true} onClose={onClose}>
            <DialogTitle>
                Vote for community score
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} >
                    <Grid xs={12}>
                        You own { (Number(lpBalance || 0) / (10**6)) } uLPs
                    </Grid>
                    
                   </Grid>
                <div className="Button">
                    <Button onClick={()=>onClick()}>Vote</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
export default VoteTokenDialog;