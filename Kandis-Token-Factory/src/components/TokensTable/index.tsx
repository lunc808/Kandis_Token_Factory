import "./TokensTable.scss";
import { useState } from 'react'
import { TokenData, TokenOverallInfo } from '../../models/query';
import { Paper, Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, useTheme, useMediaQuery } from '@mui/material';
import { Address } from "../../models/address";
import TokensTableHeader, { Order, HeaderData, HeadCell } from "./../TokensTableHeader";
import Loader from "../Loader";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from 'notistack';
import { CheckBox, CheckBoxOutlineBlank, FeaturedPlayList, FeaturedPlayListOutlined, Scoreboard } from "@mui/icons-material";
import { TokenUtils } from "../../models/token";

export const getElipsisedAddr = (address: string) => {
    const length = address.length;
    return address.substring(0, 10) + "..." + address.substring(length - 6, length)
}


type Props = {
    tokens: Array<TokenOverallInfo>,
    loading: boolean,
    fullpage?:boolean,
    isAdmin?: boolean,
    onRowClick: (id: Address) => void;
    onRowFeatured?: (id: Address) => void;
}

const headCells: Array<HeadCell> = [
    {
        id: 'logo',
        disablePadding: true,
        label: ''
    },
    
    {
        id: 'score',
        disablePadding: false,
        
        numeric: true,
        label: 'Score'
    },
    {
        id: 'symbol',
        disablePadding: false,
        label: 'Symbol'
    },
    {
        id: 'name',
        disablePadding: false,
        label: 'Name'
    },
    {
        id: 'total_supply',
        numeric: true,
        disablePadding: false,
        label: 'Total supply',
    },
    {
        id: 'description',
        disablePadding: false,
        label: 'Address',
    },
];

function TokensTable(props: Props) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(props.fullpage ? 1000 : 10);
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof HeaderData>("symbol");
    const { enqueueSnackbar } = useSnackbar();

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    function getComparator<Key extends keyof any>(
        order: Order,
        orderBy: Key,
    ): (
        a: { [key in Key]: number | string },
        b: { [key in Key]: number | string },
    ) => number {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    const getRankingComparator = (
        a: TokenOverallInfo,
        b: TokenOverallInfo,
    ):number => {
        const scoreA = a.token_feature ? TokenUtils.getTotalScore(a.token_feature) : 0;
        const scoreB = b.token_feature ? TokenUtils.getTotalScore(b.token_feature) : 0;
        return scoreB - scoreA;
    }


    const handleRequestSort = (
        _event: React.MouseEvent<unknown>,
        property: keyof HeaderData,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
        const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) {
                return order;
            }
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }

    

    const onTokenClick = (token: any) => () => props.onRowClick(token.token_data?.address as any)
    const onRowFeatured = (token: any) => () => props.onRowFeatured && props.onRowFeatured(token.token_data?.address as any)

    const Theme = useTheme();

    const isXSmall = useMediaQuery(Theme.breakpoints.up('xs'));
    const isSmall = useMediaQuery(Theme.breakpoints.up('sm'));
    const isMedium = useMediaQuery(Theme.breakpoints.up('md'));
    const isLarge = useMediaQuery(Theme.breakpoints.up('lg'));
    const isXLarge = useMediaQuery(Theme.breakpoints.up('xl'));

    const getActionCell = (token:TokenOverallInfo) => {
        if ( props.isAdmin ) {
            return token.token_feature?.visible ? <CheckBox/> : <CheckBoxOutlineBlank/>;
        } else {
            return Number(token.token_feature?.amount_of_issuer || 0) > 0  && <FeaturedPlayListOutlined/>
        }
    }

    return (
        <TableContainer className="TokensTable"
            component={Paper}
            style={{ flexGrow: props.fullpage ? "0" : "1", paddingBottom: props.fullpage ? "1rem" : "0"}}>

            {!props.fullpage && props.loading && <Loader />}
            <Table style={{ marginBottom: props.fullpage ? "0px" : "auto", backgroundColor: "transparent" }}>
                <TokensTableHeader
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    headCells={props.fullpage || props.isAdmin ?  [...headCells, {
                        id: 'action',
                        disablePadding: false,
                        label: props.isAdmin ? 'Visible' : 'Featured',
                    },] : headCells} />
                <TableBody>
                    {stableSort((props as any).tokens, getRankingComparator)
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((token, index) => (
                            <TableRow className="TokenRow"
                                key={index}
                            >
                                {isSmall && <TableCell  style={{ "width": "50px" }} onClick={onTokenClick(token)}>
                                    {(token.token_data?.logo as any)?.url &&
                                        <img src={((token.token_data?.logo as any)?.url)}
                                            alt=""
                                            className="image-size"/>
                                    }

                                </TableCell>}
                                {isXSmall && <TableCell style={{ "width": "100px","textAlign": "center" }} onClick={onTokenClick(token)} sx={{fontSize: 12}}>
                                    {TokenUtils.getBalanceString(TokenUtils.getTotalScore(token.token_feature),0) }
                                </TableCell>}
                                {isXSmall && <TableCell style={{ "width": "100px" }} onClick={onTokenClick(token)} sx={{fontSize: 12}}>
                                    {token.token_data?.symbol}
                                </TableCell>}
                                {isXSmall && <TableCell style={{ "width": "100px" }} onClick={onTokenClick(token)} >
                                    {token.token_data?.name}
                                </TableCell>}
                                {isSmall && <TableCell style={{ "textAlign": "center" }} onClick={onTokenClick(token)} >{token.token_data?.total_supply &&
                                    <span>{TokenUtils.getBalanceString(token.token_data?.total_supply, token.token_data?.decimals)}</span>
                                }</TableCell>}
                                {isSmall && <TableCell className="DescriptionTableCell" onClick={(e) => {
                                    e.preventDefault();
                                    navigator.clipboard.writeText(token.token_data?.address as string);
                                    enqueueSnackbar("Copied address", { variant: "info" });
                                }} >
                                    <div>{isLarge && <span>{getElipsisedAddr(token.token_data?.address as string)} </span>}
                                        <ContentCopyIcon style={{ "width": "18px", "height": "18px" }} /></div>
                                </TableCell>}

                                {(props.fullpage || props.isAdmin) && <TableCell style={{ "textAlign": "center" }} onClick={onRowFeatured(token)} >
                                    {getActionCell(token)}
                                    </TableCell>}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
            {!props.fullpage &&
            <TablePagination className="TokenPagination"
                component="div"
                rowsPerPageOptions={[5, 10, 15, 25]}
                count={props.tokens.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage} />
            }
        </TableContainer>
    )
}
export default TokensTable;
