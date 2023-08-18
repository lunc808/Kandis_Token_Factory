import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import { TokenHolder } from "../../models/query";
import AddressComponent from "../AddressComponent";
import Loader from "../Loader";
import "./TokenHoldersList.scss";
import { useNavigate } from 'react-router-dom';
import { TokenUtils } from "../../models/token";

type Props = {
    holders: Array<TokenHolder>,
    decimals: number,
    symbol: string,
    totalSupply: number,
    pageLoading: boolean,
    loading: boolean
    onPageChanged: (page:number, count:number)=> void
}

function TokenHoldersList(props: Props) {
    const { holders, pageLoading, decimals, totalSupply, loading, onPageChanged } = props;
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        // onPageChanged(page, rowsPerPage);
    })

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
        onPageChanged(newPage, rowsPerPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        onPageChanged(0, parseInt(event.target.value, 10));
    };

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    return (
        <TableContainer className="TokenHoldersList"
            component={Paper}>
            {!pageLoading && loading && <Loader></Loader>}
            <Table style={{ marginBottom: "auto" }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Holder address</TableCell>
                        <TableCell>Balance</TableCell>
                        <TableCell align="right">{!isMobile ? "Holding (%)" : "%"}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {holders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((holder, index) => (
                        <TableRow className="AccountBalanceRow" key={index}>
                            <TableCell component="th" style={{cursor:"pointer"}}
                                onClick={()=>{window.open(`https://finder.terra.money/classic/address/${holder.address}`)}}>
                                <AddressComponent address={holder.address} />
                            </TableCell>
                            <TableCell>
                                <span>{holder.balance >= 0 ? TokenUtils.getBalanceString(holder.balance, decimals) : "--"} {props.symbol}</span>
                            </TableCell>
                            <TableCell align="right">
                                <span>{holder.balance >= 0 ? TokenUtils.getBalanceString(holder.balance * 100 / totalSupply, 0): "--"} %</span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination className="TokenPagination"
                component="div"
                rowsPerPageOptions={[5, 10, 15, 25]}
                count={holders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage} />
        </TableContainer>
    );
}

export default TokenHoldersList;