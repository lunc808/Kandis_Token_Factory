import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,  Container, Checkbox, Input, TextField } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect, useState } from "react";
import { Address } from "../../models/address";
import Loader from "../Loader";
import "./ImportTokenDialog.scss";
import { CheckBoxRounded, CheckBoxSharp } from "@mui/icons-material";

type ImportTokenProps = {
    onImportToken: (token: string)=> any;
};

function ImportTokenDialog(props: ImportTokenProps) {
    const [token, setToken] = useState("");

    const onChange = (e: any) => {
        setToken(e.target.value);
    }

    const onClick = () => {
        props.onImportToken(token);
    }

    const onClose = () => {
        props.onImportToken("");
    }

    return (
        <Dialog className="ImportTokenDialog" open={true} onClose={onClose}>
            <DialogTitle>
                Import Token
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} >
                    <Grid xs={12}>
                        Token Address
                    </Grid>
                    <Grid xs={12}>
                        <TextField fullWidth
                            className='InputField'
                            id="name"
                            type="text"
                            label=""
                            onChange={(event) => onChange(event)}
                            required
                            variant="outlined"
                            defaultValue={token} />
                    </Grid>
                </Grid>
                <div className="Button">
                    <Button onClick={()=>onClick()}>Import</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
export default ImportTokenDialog;