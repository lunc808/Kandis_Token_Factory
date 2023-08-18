import { Button, Menu } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { ConnectType, useConnectedWallet, useWallet } from '@terra-money/wallet-provider';
import { useEffect, useState } from 'react';
import './ConnectWalletButton.scss';
import AddressComponent from './../AddressComponent';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from 'notistack';
import { getServiceInfo } from '../../contract/query';
import { AdminPanelSettings, Dashboard } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';

function ConnectWalletButton() {
    const { enqueueSnackbar } = useSnackbar();
    const {
        availableConnectTypes,
        availableInstallTypes,
        connect,
        install,
        disconnect,
    } = useWallet()
    const connectedWallet = useConnectedWallet();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isAdmin, setAdmin] = useState<boolean>(false);
    const open = Boolean(anchorEl);

    useEffect(()=>{
        const preFetch = async () => {
          let isAdmin = false;
          try {
            if (connectedWallet && connectedWallet.walletAddress) {
                let serviceInfo = await getServiceInfo(connectedWallet)
                isAdmin = ( connectedWallet.walletAddress == serviceInfo.admin_address ) 
            }
            else {
              isAdmin = false;
            }
          } catch (e) {
            isAdmin = false;
          }
          setAdmin(isAdmin);
      }
      preFetch()
    })

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {

        

        // if ( !connectedWallet && availableConnectTypes.indexOf(ConnectType.EXTENSION) > -1) {
        //     connect(ConnectType.EXTENSION);
        // }

        // if ( !connectedWallet && availableInstallTypes.indexOf(ConnectType.EXTENSION) > -1) {
        //     install(ConnectType.EXTENSION);
        // }

        // if ( connectedWallet ) {
        //     // disconnect();
        //     setAnchorEl(event.currentTarget); 
        // }


        setAnchorEl(event.currentTarget);
    };

    const handleConnect = (option: ConnectType) => {
        connect(option);
        setAnchorEl(null);
    };

    const handleInstall = (option: ConnectType) => {
        install(option);
        setAnchorEl(null);
    };

    const onCopyAddress = () => {
        if (connectedWallet) {
            navigator.clipboard.writeText(connectedWallet.terraAddress);
            enqueueSnackbar(`Address copied successfully`, { variant: "success" });
            setAnchorEl(null);
        }
    }

    const onDashboard = () => {
        if (connectedWallet) {
            navigate("/dashboard");
            setAnchorEl(null);
        }
    }

    const onDisconnectWallet = () => {
        disconnect();
        setAnchorEl(null);
    }

    const navigate = useNavigate();
    const moveAdmin = () => navigate("/admin")

    return (
        <div className="ConnectWalletButton logo-img">
            {isAdmin && <Button id="AdminPanelButtonMenu"
                variant="outlined"
                aria-controls={open ? 'ConnectWalletOptions' : undefined}
                aria-expanded={open ? 'true' : undefined}
                disableRipple
                onClick={moveAdmin}>
                {connectedWallet && <>
                    <AdminPanelSettings fontSize="inherit" />
                    <AddressComponent maxWidth='120px' address="Admin Panel" />
                </>
                }
            </Button>
        }
            
        <Button id="ConnectWalletButtonMenu"
            variant="outlined"
            aria-controls={open ? 'ConnectWalletOptions' : undefined}
            aria-expanded={open ? 'true' : undefined}
            
            className={connectedWallet ? "" : "connected"}
            onClick={handleClick}>
            {connectedWallet && <>
                <PersonIcon fontSize="inherit" />
                <AddressComponent maxWidth='120px' address={connectedWallet.terraAddress} />
            </>
            }
            <span>{!connectedWallet && "Connect Wallet"}</span>
        </Button>

            <Menu id="ConnectWalletOptions"
                MenuListProps={{ 'aria-labelledby': 'ConnectWalletButtonMenu' }}
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}>
                {!connectedWallet && availableConnectTypes.filter(v=>v.toLowerCase() != "readonly" ).map((option) => (
                     <MenuItem key={option}
                        onClick={() => handleConnect(option)}>
                        {option}
                    </MenuItem>
                ))
                }


                {!connectedWallet && availableInstallTypes.map((option) => (
                    <MenuItem key={option}
                        onClick={() => handleInstall(option)}>
                        {option}
                    </MenuItem>
                ))}

                {connectedWallet && [
                    <MenuItem key="random1" onClick={() => onCopyAddress()}>
                        <span className="CopyEntry">
                            <ContentCopyIcon />
                            <span>Copy Address</span>
                        </span>
                    </MenuItem>,
                    <MenuItem key="random3" onClick={() => onDashboard()}>
                        <span className="CopyEntry">
                            <Dashboard />
                            <span>Dashboard</span>
                        </span>
                    </MenuItem>,
                    <MenuItem key="random2" onClick={() => onDisconnectWallet()}>
                        Disconnect
                    </MenuItem>
                ]}
            </Menu>
        </div>
    );
}

export default ConnectWalletButton;