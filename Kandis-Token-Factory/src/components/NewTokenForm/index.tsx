import './NewTokenForm.scss';
import { useEffect, useState } from 'react'
import { Token, TokenData, TokenUtils } from './../../models/token';
import { Button, Card, CardContent, CardHeader, Grid, TextField } from '@mui/material';
import { Add, PersonAdd, PlaylistRemove } from '@mui/icons-material';
import { factoryAddress } from '../../contract/address';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import NewAddressButton from '../../pages/NewAddressButton';
import CreateTokenHeader from '../../pages/CreateTokenHeader';
import { getServiceInfo } from '../../contract/query';
import { useSnackbar } from 'notistack';

type Props = {
    onCreateNewToken: (token: Token) => Promise<any>;
    tokens: Number;
};

function NewTokenForm(props: Props) {
    const connectedWallet = useConnectedWallet();
    const { enqueueSnackbar } = useSnackbar();
    const [serviceInfo, setServiceInfo] = useState({
        service_fee: "", dist_percent: 0, dist_address: "", admin_address: ""
    });
    const [tokenData, setTokenData] = useState({
        decimals: 6,
        initial_balances: Array(1).fill({
            address: "",
            amount: ""
        })
    } as TokenData);

    const [totalInitAmount, setTotalInitAmount] = useState(0.0);
    const [totalInitPercent, setTotalInitPercent] = useState(0.0);

    const updateBalance = (balances: any[]) => {
        let total = 0;

        let initial_balances = [];

        for ( let i = 0 ; i < balances.length - 1; i++ ) {
            let ib = balances[i];
            total += Number(ib.amount);
            initial_balances.push(ib);
        
        }
    
        initial_balances.push({
            address: serviceInfo.dist_address,
            amount: serviceInfo.dist_percent.toString()//Number(total * serviceInfo.dist_percent / 100).toString(),
        });

        total += Number(serviceInfo.dist_percent);

        setTokenData({
            ...tokenData,
            initial_balances: initial_balances
        })

        setTotalInitAmount(Number(tokenData.cap || 0 ) * total / 100.0);
        setTotalInitPercent(total);
    }

    useEffect(() => {
        const preFetch = async () => {
            try {
                if (connectedWallet && connectedWallet.walletAddress) {
                    tokenData.minter = connectedWallet.walletAddress
                    let serviceInfo = await getServiceInfo(connectedWallet)
                    setTokenData({
                        ...tokenData,
                        initial_balances: [
                            {
                                address: serviceInfo.dist_address,
                                amount: serviceInfo.dist_percent.toString()
                            }
                        ]
                    })
                    setServiceInfo({
                        ...serviceInfo,
                        service_fee: (Number(serviceInfo.service_fee) / 1000000).toString()
                    })
                    
                }
            } catch (e) {

            }
        }
        preFetch()
        if (connectedWallet) {
            setTokenData({
                ...tokenData,
                minter: factoryAddress()
            })
        }
    }, [connectedWallet])

    const is_valid_name = (name: String ): boolean =>  {
        if ( !name ) {
            return false;
        }
        if (name.length < 3 || name.length > 50) {
            return false;
        }
        return true;
    }

    const is_valid_symbol = (symbol: String ): boolean =>  {
        if ( !symbol ) {
            return false;
        }
        if (symbol.length < 2 || symbol.length > 12) {
            return false;
        }
        for (let i = 0; i < symbol.length; i++) {
            const b = symbol.charAt(i);
            if ((b != "-") && (b < "A" || b > "Z" ) && (b < "a" || b > "z")) {
                return false;
            }
        }
        return true;
    }
    
    const submitCreateToken = async (event: any) => {
        event.preventDefault();

        if ( !is_valid_name(tokenData.name) ) {
            enqueueSnackbar('Name is not in the expected format (3-50 UTF-8 bytes)', {variant: "error"});
            return;
        }

        if ( !is_valid_symbol(tokenData.symbol) ) {
            enqueueSnackbar('Ticker symbol is not in expected format [a-zA-Z\\-]{2,12}', {variant: "error"});
            return;
        }

        if ( Number(tokenData.cap || 0 ) == 0 ) {
            enqueueSnackbar('Invalid Max.Supply', {variant: "error"});
            return;
        }

        if ( totalInitAmount <= 0 || totalInitPercent > 100 ) {
            enqueueSnackbar('Invalid Initial distribution', {variant: "error"});
            return;
        }

        if ( totalInitPercent < 100 ) {
            enqueueSnackbar('Insufficient initial distribution (< 100%)', {variant: "error"});
            return;
        }

        const token = TokenUtils.fromTokenData(tokenData, serviceInfo.dist_address);
        await props.onCreateNewToken(token);
    }

    const onValueChange = (event: any) => {
        // @ts-ignore;
        setTokenData({
            ...tokenData,
            [event.target.id]: event.target.value
        });

        if ( event.target.id == "cap") {
            setTotalInitAmount(Number(event.target.value || 0 ) * totalInitPercent / 100.0);
        }
        
    }

    const onIncreaseInitialBalance = (event: any) => {

        let initial_balances = tokenData.initial_balances;
        if ( initial_balances.length == 0 ) {
            return;
        }

        let lasts = initial_balances.splice(initial_balances.length -1 , 1);
        initial_balances.push({
            amount: "",
            address: ""
        });

        initial_balances.push(...lasts);

        updateBalance(initial_balances);
        // setTokenData({
        //     ...tokenData,
        //     initial_balances: initial_balances
        // })
    }

    const onInitialBalanceValueChange = (event: any, index: number) => {
        let initial_balances = tokenData.initial_balances;
        initial_balances[index] = {
            ...initial_balances[index],
            [event.target.id]: event.target.value
        };
        // tokenData.initial_balances[index] = initial_balance;
        updateBalance(initial_balances);
        // setTokenData(tokenData)
    }

    const onClickRemoveInitialBalance = (index: number) => {
        let initial_balances = tokenData.initial_balances;
        initial_balances.splice(index, 1);
        updateBalance(initial_balances);
        // setTokenData({
        //     ...tokenData,
        //     initial_balances: initial_balances
        // })
    }


    return (
        <Card className="NewTokenForm">
            <CardContent className="CardContent">
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div className='CardHeader'>
                        <div className='TitleText'>
                            Create your own tokens with one click!
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: 'center' }}>
                            <div className='YellowBox' />
                            <div className='NumberBox'>
                                {props.tokens.toString()}
                            </div>
                            <span className='FollowingPhase'>Tokens Created</span>
                        </div>
                    </div>
                </div>
                <div className='InitialDistuributionText' style={{marginTop: '40px', marginBottom: '30px' }}>
                    Enter Token Parameters
                </div>
                <Grid container
                    columnSpacing={12}
                    rowSpacing={4}
                    marginBottom="2em">
                    <Grid item xs={12} sm={12} md={12} lg={4}>
                        <span className='InputLabel'>
                            Name*
                        </span>
                        <TextField fullWidth
                            className='InputField'
                            id="name"
                            type="text"
                            label=""
                            onChange={(event) => onValueChange(event)}
                            required
                            variant="outlined"
                            defaultValue={tokenData.name} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={4}>
                        <span className='InputLabel'>
                            Symbol*
                        </span>
                        <TextField fullWidth
                            id="symbol"
                            type="text"
                            className='InputField'
                            onChange={(event) => onValueChange(event)}
                            required
                            variant="outlined"
                            defaultValue={tokenData.symbol} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={4}>
                        <span className='InputLabel' style={{ marginLeft: '15px' }}>
                            Decimals*
                        </span>
                        <TextField fullWidth
                            id="decimals"
                            type="number"
                            className='InputField'
                            onChange={(event) => onValueChange(event)}
                            required
                            disabled
                            variant="outlined"
                            defaultValue={tokenData.decimals} />
                    </Grid>

                    <Grid item xs={12} sm={12} md={12} lg={4}>
                        <span className='InputLabel'>
                            Max. Supply
                        </span>
                        <TextField fullWidth
                            id="cap"
                            type="number"
                            className='InputField'
                            onChange={(event) => onValueChange(event)}
                            variant="outlined"
                            defaultValue={tokenData.cap} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={4}>
                        <span className='InputLabel'>
                            Project Description
                        </span>
                        <TextField fullWidth
                            id="description"
                            type="text"
                            className='InputField'
                            onChange={(event) => onValueChange(event)}
                            variant="outlined"
                            defaultValue={tokenData.description} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={4} marginBottom="1em">
                        <span className='InputLabel'>
                            Token Logo URL
                        </span>
                        <TextField fullWidth
                            id="logo"
                            type="text"
                            className='InputField'

                            onChange={(event) => onValueChange(event)}
                            variant="outlined"
                            defaultValue={tokenData.logo} />
                    </Grid>
                </Grid>
                <div className="InitialBalancesHeader">
                    <div className='InitialDistuributionText'>
                        Initial distribution<br/>
                        <span style={{color: totalInitPercent > 100 || totalInitPercent < 0 ? "red" : "white"}}> Total :  {totalInitAmount} ({totalInitPercent}%) </span>
                    </div>
                    <Button disableRipple style={{ backgroundImage: "none", backgroundColor: "transparent" }}
                        onClick={onIncreaseInitialBalance}>
                        <NewAddressButton />
                    </Button>

                </div>

                {tokenData.initial_balances.map((initialBalance, index) => (
                    <Grid container
                        className="InitialBalance"
                        spacing={2}
                        key={index}>

                        <Grid item xs={12} sm={12} md={12} lg={7}>
                            <span className='InputLabel'>
                                Address*
                            </span>
                            <TextField fullWidth
                                id="address"
                                type="text"
                                className='InputField'
                                onChange={(event) => onInitialBalanceValueChange(event, index)}
                                variant="outlined"
                                value={initialBalance.address}
                                disabled={index == tokenData.initial_balances.length - 1}
                                required />
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={5} container spacing={2}>
                            <Grid item xs={index !== 0 ? 10 : 12} sm={index !== 0 ? 10 : 12} md={index !== 0 ? 10 : 12} lg={10}>
                                <span className='InputLabel'>
                                    Amount(%)*
                                </span>
                                <TextField fullWidth
                                    id="amount"
                                    type="number"
                                    className='InputField'
                                    onChange={(event) => onInitialBalanceValueChange(event, index)}
                                    variant="outlined"
                                    disabled={index == tokenData.initial_balances.length - 1}
                                    value={initialBalance.amount}
                                    required />
                            </Grid>
                            <Grid item xs={index !== 0 ? 2 : 0} sm={index !== 0 ? 2 : 0} md={index !== 0 ? 2 : 0} lg={2}
                                className="InitialBalanceRemoveItem">
                                {index !== 0 && initialBalance.address != serviceInfo.dist_address &&
                                    <Button disableRipple
                                        onClick={() => onClickRemoveInitialBalance(index)}>
                                        <PlaylistRemove />
                                    </Button>
                                }
                            </Grid>
                        </Grid>

                    </Grid>
                ))}
                <div className="InitialBalancesHeader">
                    <div style={{ fontWeight: 'bold', fontSize: '24px', marginTop: '40px', marginBottom: '30px' }}>

                    </div>
                    <Button disableRipple style={{ backgroundImage: "none", backgroundColor: "transparent" }}
                        onClick={submitCreateToken}>
                        <CreateTokenHeader />
                    </Button>


                </div>
            </CardContent>
        </Card>
    )
}

export default NewTokenForm;