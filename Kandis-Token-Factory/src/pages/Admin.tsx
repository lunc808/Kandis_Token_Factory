import { ConnectedWallet, useConnectedWallet, useWallet, WalletStatus } from "@terra-money/wallet-provider";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import ServiceInfoForm from "../components/ServiceInfoForm"
import { Token } from "../models/token";
import * as execute from "./../contract/execute";
import * as query from "./../contract/query";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import WidthdrawDialog, { CloseType } from "../components/WithdrawDialog"
import { TokenOverallInfo } from "../models/query";
import TokensTable from "../components/TokensTable";
import { Address } from "../models/address";

function Admin() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0 as Number)
  const navigate = useNavigate()
  const connectedWallet = useConnectedWallet() as ConnectedWallet
  const wallet = useWallet()
  const [tokens, setTokens] = useState(new Array<TokenOverallInfo>())
  
  const fetchData = async () => {
    if (wallet.status === WalletStatus.WALLET_CONNECTED) {
      try {
        const tokensInfo = await query.getMintedTokens(connectedWallet);
        const tokensPromises = tokensInfo.minted_tokens.map(tokenInfo=>{
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
                    ...tokensInfo.minted_tokens[index],
                    max_of_issuer: tokensInfo.max_of_issuer,
                    max_of_member: tokensInfo.max_of_member

                }
            }
        });

        setTokens(tokens);
      } catch (err) {
        console.log(err);
      }
      setLoading(false)
    }
    else {
      setLoading(true)

    }
  }

  useEffect(() => {
    fetchData()
    fetchTokenBalance()
  }, [wallet, connectedWallet])

  const onUpdateServiceInfo = async (service_info: any): Promise<any> => {
    setLoading(true);
    try {
      const {service_fee, dist_percent, dist_address, admin_address} = service_info;

      if ( dist_percent < 0 || dist_percent > 99 ) {
        enqueueSnackbar(`Invalid dist percent`, {variant: "error"});
          return;
      }

      if ( service_fee < 0  ) {
        enqueueSnackbar(`Invalid dist percent`, {variant: "error"});
          return;
      }

      const service_fee_denoms = Number(service_fee) * 1000000;
      const response = await execute.updateServiceInfo( service_fee_denoms.toString(), dist_percent.toString(), dist_address, admin_address, wallet, connectedWallet);


      if (response && response.logs) {
        enqueueSnackbar(`successfully updated service info`, {variant: "success"});
        if ( admin_address != connectedWallet.walletAddress ) {
          navigate(`/`);
          return;
        }
      }
    }
    catch(e) {
      console.log(e);
      enqueueSnackbar(`${e}`, {variant: "error"});
    }
    setLoading(false);
  }

  const fetchTokenBalance = async () => {
    if (wallet.status === WalletStatus.WALLET_CONNECTED) {
      try {
        const response = await query.getFactoryTokenBalance();  
        setTotalAmount(Number(response.balance) / (10 ** 6));
      } catch (err) {
        console.log(err);
        setTotalAmount(0);
      }
    }
  }

  const onSubmitData = async (closeType : CloseType, amount: Number) => {
    try {
        if(closeType === 'SUBMIT'){
            setLoading(true);
            await execute.widthraw(amount, wallet, connectedWallet);
            enqueueSnackbar(`KLT Tokens withdrawn successfully`, {variant: "success"});
        }
        fetchTokenBalance();
    }
    catch(e) {
        enqueueSnackbar(`${e}`, {variant: "error"});
    }

    setLoading(false);
    setDialogOpen(false);
}

  const onRowClick = (address: Address) => {};
  const onRowFeatured = async (address: Address) => {
      setLoading(true);
      try {
        let token = tokens.filter(v=>v.token_data?.address == address);
        if ( token.length == 0 ) {
          return;
        }
        await execute.updateVisible(address, !token[0].token_feature?.visible, wallet, connectedWallet);
        await fetchData();
      } catch (err) {
          console.log(err);
      }
      setLoading(false);

      
  }

  return (
    <div className="Admin">
      {loading && <Loader />}
      <ServiceInfoForm onUpdateServiceInfo={onUpdateServiceInfo} totalAmount={totalAmount} onShowDialog={()=>setDialogOpen(true)}/>
      <WidthdrawDialog open={dialogOpen} totalAmount={totalAmount} onSubmitData={onSubmitData}/>
      <h3>Tokens List</h3>
      <TokensTable tokens={tokens}
                loading={false}
                onRowClick={onRowClick} 
                isAdmin={true}
                onRowFeatured={onRowFeatured}/>
    </div>
  )
}
export default Admin;