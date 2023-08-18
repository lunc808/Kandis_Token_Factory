import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,  Container, Checkbox } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect, useState } from "react";
import { Address } from "../../models/address";
import Loader from "../Loader";
import "./DisclaimerDialog.scss";
import { CheckBoxRounded, CheckBoxSharp } from "@mui/icons-material";

type DisclaimerProps = {
    open: boolean,
    onAccepted: ()=> any;
};

function DisclaimerDialog(props: DisclaimerProps) {
    const {open} = props;
    const [agreed, setAgreed] = useState(false);

    const onAgreeChange = () => {
        setAgreed(!agreed);
    }

    const onAccepted = () => {
        if ( !agreed ) {
            return;
        }

        window.localStorage.setItem("agreed", "agreed");

        props.onAccepted();
    }

    return (
        <Dialog className="DisclaimerDialog"
            open={open}>
            <DialogTitle>
                Disclaimer
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} >
                    <Grid xs={12}>
                        <b>
                            No Investment Advice
                        </b>
                    </Grid>
                    <Grid xs={12}>
                        This information provided on Kandis protocol does not constitute
                        investment advice, financial advice, trading advice, or any other sort of
                        advice and you should not treat any of the website's content as such.
                        Kandis protocol does not recommend that any cryptocurrency should
                        be bought, sold, or held by you. Do conduct your own clue diligence
                        and consult your financial advisor before making any investment
                        decisions.
                    </Grid>

                    <Grid xs={12} className="header">
                        <b>
                            Accuracy of Information
                        </b>
                    </Grid>
                    <Grid xs={12}>
                        Kandis protocol will strive to ensure accuracy of information listed on
                        this website although it will not hold any responsibility for any missing
                        or wrong information. Kandis protocol provides all information as is.
                        You understand that you are using any and all information available
                        here at your own risk.
                    </Grid>

                    <Grid md={10} xs={12} mdOffset={1} className="AgreeCheck">
                        <div>
                            <Checkbox color="default" checked={agreed} onChange={()=>onAgreeChange()}/>
                        </div>
                        <div>
                            <span>
                                I agree to the <a ><u>Terms and Conditions</u></a> and acknowledge that I have<br/>read and understood the disclaimer.
                            </span>
                        </div>
                    </Grid>
                </Grid>
                <Button onClick={()=>onAccepted()}>Accept</Button>
            </DialogContent>
        </Dialog>
    );
}
export default DisclaimerDialog;