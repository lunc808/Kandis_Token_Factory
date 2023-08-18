import { Box, Grid, Stack, Typography } from '@mui/material';
import './ScorePieChart.scss';
import { PieChart } from '@mui/x-charts';
import { TriggerOptions } from '@mui/x-charts/ChartsTooltip/utils';
import { TokenFeature, TokenOverallInfo } from '../../models/query';
import { TokenUtils } from '../../models/token';

type Props = {
  token?: TokenFeature
}


export function ScorePieChart(props: Props) {

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const pieParams = { height: isMobile?100: 200,  margin: { right: 5 }, tooltip:{trigger: "none" as TriggerOptions}};
  const seriesParams = { 
              innerRadius: isMobile? 45 : 85,
              outerRadius: isMobile? 50 : 100,
              cornerRadius:  5,
            }

  const palette = ['red', 'blue', 'green'];

  

  const calc = (amount:string | number | Number):string=>{
    return (Number(amount) / (10**6)).toString();
  }

  const tis = props.token ? TokenUtils.getIssuerScore(props.token) : 0;
  const tcs = props.token ? TokenUtils.getMemberScore(props.token) : 0;
  const tos = props.token ? TokenUtils.getTotalScore(props.token) : 0;
  const kis = props.token ? calc(props.token.amount_of_issuer) : 0;
  const kcs = props.token ? calc(props.token.amount_of_member) : 0;
  const kos = props.token ? calc(Number(props.token.amount_of_issuer) + Number(props.token.amount_of_member)) : 0;

  

  return (
    <Grid container direction="row" width="100%" textAlign="center" spacing={isMobile? 0 : 2} className="PieStack">
      <Box flexGrow={1} className="PieBox">
        <Typography></Typography>
        <PieChart className='Piechart'
          colors={["#DC2121", "#FFFFFF32"]}
          series={[{data: [{ value: tis }, { value: 50-tis }], ...seriesParams }]}
          {...pieParams}
        />
        {
          props.token && 
          <div className="ScorePanel">
            <b className="ScoreValue">{TokenUtils.getBalanceString(tis,0)}</b> <br/>
            <span>TIS Score</span><br/>
            <span className="TokenValue"><b>{kis}</b> uLP</span>
          </div>
        }


      </Box>

      <Box flexGrow={1} className="PieBox">
        <Typography></Typography>
        <PieChart className='Piechart'
          colors={["#E57C1B", "#FFFFFF32"]}
          series={[{data: [{ value: tcs }, { value: 50-tcs }], ...seriesParams }]}
          {...pieParams}
        />
        {
          props.token && 
        <div className="ScorePanel">
          <b className="ScoreValue">{TokenUtils.getBalanceString(tcs,0)}</b> <br/>
          <span>TCS Score</span><br/>
          <span className="TokenValue"><b>{kcs}</b> uLP</span>
        </div>
        }

      </Box>

      <Box flexGrow={1} className="PieBox">
        <Typography></Typography>
        <PieChart className='Piechart'
          colors={["#1BE52F", "#FFFFFF32"]}
          series={[{data: [{ value: tos }, { value: 100-tos }], ...seriesParams }]}
          {...pieParams}
        />
        {
          props.token && 
        <div className="ScorePanel">
          <b className="ScoreValue">{TokenUtils.getBalanceString(tos,0)}</b> <br/>
          <span>TOS Score</span><br/>
          <span className="TokenValue"><b>{kos}</b> uLP</span>
        </div>
        }

      </Box>
      
    </Grid>
  )
}
