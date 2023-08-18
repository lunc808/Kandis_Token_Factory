import "./TokensTableHeader.scss";
import { TableCell, TableHead, TableRow, TableSortLabel, useMediaQuery, useTheme } from '@mui/material';
import { Box } from "@mui/system";
import { visuallyHidden } from '@mui/utils';

export type Order = 'asc' | 'desc';

export interface HeaderData {
    address: string | number,
    logo: string;
    symbol: string;
    name: string;
    total_supply: string;
    decimals: string;
    description: string;
    score: number;
    action: string;
}

export interface HeadCell {
    disablePadding: boolean;
    id: keyof HeaderData;
    label: string;
    numeric?: boolean;
}

type TokensTableHeaderProps = {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof HeaderData) => void;
    order: Order;
    orderBy: string;
    headCells: Array<HeadCell>
}

function TokensTableHeader(props: TokensTableHeaderProps) {

    const createSortHandler =
        (property: keyof HeaderData) => (event: React.MouseEvent<unknown>) => {
        props.onRequestSort(event, property);
    };

    const Theme = useTheme();

    const isXSmall = useMediaQuery(Theme.breakpoints.up('xs'));
    const isSmall = useMediaQuery(Theme.breakpoints.up('sm'));
    const isMedium = useMediaQuery(Theme.breakpoints.up('md'));
    const isLarge = useMediaQuery(Theme.breakpoints.up('lg'));

    return (
        <TableHead className="TokensTableHeader">
            <TableRow>
                {props.headCells.map((headCell) => {
                    const showFieldInMobile = headCell.id == 'score' || headCell.id == 'symbol' || headCell.id == 'name'|| headCell.id == 'action';
                    return (
                        ((showFieldInMobile && isXSmall) || (isSmall)) && 
                        <TableCell
                            className={headCell.id}
                            key={headCell.id}
                            align={headCell.numeric ? 'center' : 'left'}>
                            {headCell.label}
                        </TableCell>
                    );
                    // switch (headCell.id) {
                    //     // case 'logo':
                    //     //     return isXSmall && (
                    //     //         <TableCell
                    //     //             className={headCell.id}
                    //     //             key={headCell.id}
                    //     //             align={headCell.numeric ? 'center' : 'left'}
                    //     //             sortDirection={props.orderBy === headCell.id ? props.order : false}
                                    
                    //     //         >
                    //     //             <TableSortLabel
                    //     //                 active={props.orderBy === headCell.id}
                    //     //                 direction={props.orderBy === headCell.id ? props.order : 'asc'}
                    //     //                 onClick={createSortHandler(headCell.id)}>
                    //     //                 {headCell.label}
                    //     //                 {props.orderBy === headCell.id ? (
                    //     //                     <Box component="span" sx={visuallyHidden}>
                    //     //                         {props.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    //     //                     </Box>
                    //     //                 ) : null}
                    //     //             </TableSortLabel>
                    //     //         </TableCell>
                    //     //     );
                    //     // case 'symbol':
                    //     //     return isXSmall && (
                    //     //         <TableCell
                    //     //             className={headCell.id}
                    //     //             key={headCell.id}
                    //     //             align={headCell.numeric ? 'center' : 'left'}
                    //     //             sortDirection={props.orderBy === headCell.id ? props.order : false}
                                    
                    //     //         >
                    //     //             <TableSortLabel
                    //     //                 active={props.orderBy === headCell.id}
                    //     //                 direction={props.orderBy === headCell.id ? props.order : 'asc'}
                    //     //                 onClick={createSortHandler(headCell.id)}>
                    //     //                 {headCell.label}
                    //     //                 {props.orderBy === headCell.id ? (
                    //     //                     <Box component="span" sx={visuallyHidden}>
                    //     //                         {props.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    //     //                     </Box>
                    //     //                 ) : null}
                    //     //             </TableSortLabel>
                    //     //         </TableCell>
                    //     //     );
                    //     // case 'name':
                    //     //     return isLarge && (
                    //     //         <TableCell
                    //     //             className={headCell.id}
                    //     //             key={headCell.id}
                    //     //             align={headCell.numeric ? 'center' : 'left'}
                    //     //             sortDirection={props.orderBy === headCell.id ? props.order : false}
                                    
                    //     //         >
                    //     //             <TableSortLabel
                    //     //                 active={props.orderBy === headCell.id}
                    //     //                 direction={props.orderBy === headCell.id ? props.order : 'asc'}
                    //     //                 onClick={createSortHandler(headCell.id)}>
                    //     //                 {headCell.label}
                    //     //                 {props.orderBy === headCell.id ? (
                    //     //                     <Box component="span" sx={visuallyHidden}>
                    //     //                         {props.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    //     //                     </Box>
                    //     //                 ) : null}
                    //     //             </TableSortLabel>
                    //     //         </TableCell>
                    //     //     );

                    //     // case 'total_supply':
                    //     //     return isXSmall && (
                    //     //         <TableCell
                    //     //             className={headCell.id}
                    //     //             key={headCell.id}
                    //     //             align={headCell.numeric ? 'center' : 'left'}
                    //     //             sortDirection={props.orderBy === headCell.id ? props.order : false}
                                    
                    //     //         >
                    //     //             <TableSortLabel
                    //     //                 active={props.orderBy === headCell.id}
                    //     //                 direction={props.orderBy === headCell.id ? props.order : 'asc'}
                    //     //                 onClick={createSortHandler(headCell.id)}>
                    //     //                 {headCell.label}
                    //     //                 {props.orderBy === headCell.id ? (
                    //     //                     <Box component="span" sx={visuallyHidden}>
                    //     //                         {props.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    //     //                     </Box>
                    //     //                 ) : null}
                    //     //             </TableSortLabel>
                    //     //         </TableCell>
                    //     //     );
                    //     // case 'description':
                    //     //     return isXSmall && (
                    //     //         <TableCell
                    //     //             className={headCell.id}
                    //     //             key={headCell.id}
                    //     //             align={headCell.numeric ? 'center' : 'left'}
                    //     //             sortDirection={props.orderBy === headCell.id ? props.order : false}
                                    
                    //     //         >
                    //     //             <TableSortLabel
                    //     //                 active={props.orderBy === headCell.id}
                    //     //                 direction={props.orderBy === headCell.id ? props.order : 'asc'}
                    //     //                 onClick={createSortHandler(headCell.id)}>
                    //     //                 {headCell.label}
                    //     //                 {props.orderBy === headCell.id ? (
                    //     //                     <Box component="span" sx={visuallyHidden}>
                    //     //                         {props.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    //     //                     </Box>
                    //     //                 ) : null}
                    //     //             </TableSortLabel>
                    //     //         </TableCell>
                    //     //     );
                    //     default: return (
                    //         <TableCell
                    //             className={headCell.id}
                    //             key={headCell.id}
                    //             align={headCell.numeric ? 'center' : 'left'}
                    //             // sortDirection={props.orderBy === headCell.id ? props.order : false}
                                
                    //         >
                    //             {headCell.label}
                    //             {/* <TableSortLabel
                    //                 active={props.orderBy === headCell.id}
                    //                 direction={props.orderBy === headCell.id ? props.order : 'asc'}
                    //                 onClick={createSortHandler(headCell.id)}>
                    //                 {headCell.label}
                    //                 {props.orderBy === headCell.id ? (
                    //                     <Box component="span" sx={visuallyHidden}>
                    //                         {props.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    //                     </Box>
                    //                 ) : null}
                    //             </TableSortLabel> */}
                    //         </TableCell>
                    //     );
                    // }

                })}
            </TableRow>
        </TableHead>
    );
}
export default TokensTableHeader;