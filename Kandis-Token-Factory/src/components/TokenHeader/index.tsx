import { Button, Card, Grid } from "@mui/material";
import "./TokenHeader.scss";
import AddIcon from '@mui/icons-material/Add';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { NavLink } from "react-router-dom";
import VoteTokenHeader from "../../pages/VoteTokenHeader";

type Props = {
    onOpenVoteToken: () => void,
    onEditToken: () => void,
    isMyToken: boolean
};

function TokenHeader(props: Props) {
    return (
        // <Grid className="TokenHeader"
        //     container
        //     spacing={3}>
        //     <Grid item xs={8}>
        //         <Card className="TokenCardHeader">
        //             <NavLink className="NavBackAction" to="/tokens">
        //                 <ArrowBackIcon/>
        //                 <h3>Back to tokens list</h3>
        //             </NavLink>
        //         </Card>
        //     </Grid>
        //     <Grid item xs={4}>
        //         <Card className="TokenHeaderCardAction">
        //             { props.isMyToken && <Button disableRipple style={{ backgroundImage: "none", backgroundColor: "transparent" }}
        //                 onClick={props.onEditToken} >
        //                     <VoteTokenHeader/>
        //                 </Button> }

        //             { !props.isMyToken && <Button disableRipple style={{ backgroundImage: "none", backgroundColor: "transparent" }}
        //                 onClick={props.onOpenVoteToken} >
        //                     <VoteTokenHeader/>
        //                 </Button>}
        //         </Card>
        //     </Grid>
            
        //     <Grid item xs={12}> </Grid>
        // </Grid>
        <div style={{ display: 'flex', justifyContent: 'space-between' }} className="TokenHeader">
            <Card className="TokenCardHeader">
                <NavLink className="NavBackAction" to="/tokens">
                    <ArrowBackIcon/>
                    <h3>Back to tokens list</h3>
                </NavLink>
            </Card>

                { !props.isMyToken && <Button disableRipple style={{ backgroundImage: "none", backgroundColor: "transparent" }}
                onClick={props.onOpenVoteToken} >
                    <VoteTokenHeader/>
                </Button>}
        </div>
    );
}
export default TokenHeader;