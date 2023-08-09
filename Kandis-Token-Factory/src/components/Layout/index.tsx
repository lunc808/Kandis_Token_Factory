import "./Layout.scss";
import TokenIcon from '@mui/icons-material/Token';
import { AppBar, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, useTheme, useMediaQuery } from '@mui/material'
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import ConnectWalletButton from '../ConnectWalletButton';
import { useEffect, useState } from "react";

type Props = {
    menu: Array<{
        path: string;
        element: JSX.Element;
        title: string;
        icon: JSX.Element;
    }>,
    routesList: Array<{
        path: string;
        element: JSX.Element;
        title: string;
    }>
    children: React.ReactElement<any, string | React.JSXElementConstructor<any>> | null,
};

function Layout(props: Props) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [title, setTitle] = useState("");

    useEffect(() => {
        props.routesList.forEach( page => {
            if (pathname === page.path){
                return setTitle(page.title);
            } else if(pathname.lastIndexOf("/") > 1){
                const fixPath = pathname.slice(0, pathname.lastIndexOf("/"));

                if(fixPath+"/:id" === page.path){
                    return setTitle(page.title);
                }
            }
        })

    }, [pathname])

    const onNavigateToPage = (event: any, index: number) => {
        event?.preventDefault();
        let page = props.menu[index];
        navigate(page.path);
        setTitle(page.title);
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const Theme = useTheme();
    const isMedium = useMediaQuery(Theme.breakpoints.up('md'));

    return (
        <div className="AppLayout">
            <AppBar className="AppNavbar" position="static">
                <List className="NavbarList">
                    <NavLink className="NavLink" to="/">
                        <ListItem className="AppLogo">
                            <TokenIcon className="AppIcon" />
                            <Typography variant="subtitle1">
                                Token <b>Factory</b>
                            </Typography>
                        </ListItem>
                    </NavLink>
                    {props.menu.map((menuItem, index) => (
                        <ListItem key={index}
                            className="NavItem"
                            disablePadding>
                            <NavLink className="NavLink"
                                to={menuItem.path}
                                onClick={(event) => onNavigateToPage(event, index)}
                                style={({ isActive }) => (isActive ? { color: '#439cf4' } : {})}>
                                <ListItemButton className="NavButton">
                                    {menuItem.icon}
                                    <ListItemText primary={menuItem.title} />
                                </ListItemButton>
                            </NavLink>
                        </ListItem>
                    ))}
                </List>
            </AppBar>

            <div className="AppBody">
                <AppBar className="AppHeader" position="static">
                    <Toolbar className="AppToolbar">
                        <div className="logo-img" style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/')}>
                            <svg width="51" height="51" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M48.0842 51H2.91585C1.30503 51 0 49.695 0 48.0842V2.91585C0 1.30503 1.30503 0 2.91585 0H48.0787C49.695 0 51 1.30503 51 2.91585V48.0787C51 49.695 49.695 51 48.0842 51Z" fill="#FAD64B" />
                                <path d="M24.3535 25.5437C22.759 27.4166 20.2855 28.0718 18.0467 27.2528C17.0311 26.8814 16.1683 26.2207 15.5404 25.358C15.1636 25.8167 14.8633 26.3409 14.6504 26.9142C14.3446 27.7442 14.2463 28.6069 14.3337 29.4424C15.939 30.6164 17.9484 31.2989 20.1763 31.3317C22.628 31.3262 24.9541 30.4198 26.7287 28.465C25.9424 27.493 25.1507 26.5211 24.3535 25.5437ZM39.7954 6.21389C37.857 1.5398 32.1454 0.245688 28.0993 3.511C23.4962 7.22406 18.904 10.959 14.2845 14.6556C11.0465 17.2439 9.78515 21.219 11.0629 24.9812C11.1175 25.145 11.1776 25.3034 11.2431 25.4617C11.9038 23.7253 13.0232 22.2565 14.4756 21.2026C14.6613 19.9031 15.322 18.6581 16.5014 17.6971C21.181 13.8857 25.8769 10.0908 30.5783 6.30672C32.2055 4.99622 34.2095 5.09451 35.6073 6.50329C36.9833 7.89023 37.0543 9.89965 35.7384 11.5378C32.899 15.0488 30.0432 18.5489 27.1929 22.0599C27.0509 22.2347 26.9089 22.4094 26.767 22.5896C26.9362 22.7698 27.1 22.9609 27.2584 23.1575C27.8973 23.9547 28.5361 24.7464 29.175 25.5437C32.4458 21.5685 35.6783 17.566 38.8672 13.5308C40.5926 11.3357 40.8711 8.79665 39.7954 6.21389Z" fill="white" />
                                <path d="M38.3975 36.9723C35.3233 33.1609 32.2382 29.355 29.1695 25.5437C28.4487 26.4228 27.7225 27.2965 27.0017 28.1701C26.9143 28.2739 26.8269 28.3776 26.7396 28.4759C29.7046 32.1289 32.6586 35.7928 35.6072 39.4567C36.9177 41.0839 36.8195 43.0879 35.4107 44.4858C34.0237 45.8618 32.0143 45.9328 30.3762 44.6168C26.8597 41.7774 23.3596 38.9216 19.8486 36.0713C18.6964 35.1376 17.5279 34.2148 16.3921 33.2592C15.1963 32.2545 14.4865 30.8894 14.3336 29.4533C12.963 28.4486 11.8873 27.0835 11.2375 25.4618C10.8171 26.5648 10.5823 27.777 10.5659 29.0547C10.5714 31.6266 11.5706 34.0728 13.7384 35.8693C18.5708 39.8827 23.4524 43.836 28.3777 47.7292C30.5673 49.4602 33.1064 49.7387 35.6891 48.6684C40.3687 46.7245 41.6628 41.0184 38.3975 36.9723Z" fill="black" />
                                <path d="M26.7668 22.5842C25.9751 23.567 25.1942 24.5499 24.3806 25.5109C24.3697 25.5219 24.3643 25.5328 24.3533 25.5437C24.3097 25.4891 24.2605 25.429 24.2168 25.3744C23.1029 24.0093 21.6068 23.3377 20.0888 23.294C18.2159 23.2995 16.5887 24.0912 15.5403 25.3635C14.8304 24.397 14.4209 23.1739 14.4209 21.8197C14.4264 21.6122 14.4427 21.4047 14.4755 21.2027C15.2127 20.6676 16.0372 20.2417 16.9272 19.9359C20.4655 18.7346 24.1786 19.7721 26.7668 22.5842Z" fill="black" />
                                <path d="M29.1695 25.5382C28.4487 26.4174 27.7225 27.291 27.0017 28.1647C26.9143 28.2684 26.827 28.3722 26.7396 28.4705C25.9479 27.4931 25.1561 26.5211 24.3589 25.5437C24.3698 25.5328 24.3753 25.5219 24.3862 25.5109C25.1943 24.5499 25.9806 23.5616 26.7724 22.5842C26.9416 22.7644 27.1055 22.9555 27.2638 23.152C27.8918 23.9493 28.5306 24.7465 29.1695 25.5382Z" fill="white" />
                                <path d="M14.6559 26.9197C14.3501 27.7497 14.2518 28.6124 14.3392 29.4479C12.9686 28.4432 11.8929 27.0781 11.2432 25.4563C11.9039 23.7199 13.0233 22.2511 14.4757 21.1972C14.443 21.4047 14.4266 21.6068 14.4211 21.8143C14.4211 23.163 14.8361 24.3861 15.5405 25.358C15.1637 25.8222 14.8634 26.3464 14.6559 26.9197Z" fill="black" />
                            </svg>

                        </div>
                        {isMedium && (
                            <div style={{ marginLeft: "10px", cursor: 'pointer' }}
                                onClick={() => navigate('/')}>
                                <div className="logo-img">
                                    <svg width="278" height="24" viewBox="0 0 278 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.64671 14.4691L4.70454 17.2055V23.6223H0V1.66746H4.70099V10.8527H4.95308L7.33553 7.20428L11.1915 1.66746H16.457L9.90616 10.9454L16.7695 23.6223H11.472L6.64671 14.4691Z" fill="white" />
                                        <path d="M31.9411 23.6223C30.9789 23.6223 30.2049 23.3765 29.6226 22.8812C29.0368 22.3896 28.6923 21.6805 28.5894 20.7577H28.4332C28.1385 21.8266 27.5597 22.6354 26.6934 23.1805C25.827 23.7257 24.7654 24 23.512 24C21.9462 24 20.6858 23.576 19.7342 22.7245C18.7826 21.8765 18.3069 20.6865 18.3069 19.1544C18.3069 17.4549 18.9247 16.1971 20.1567 15.3812C21.3888 14.5618 23.196 14.1556 25.5785 14.1556H28.1811V13.3361C28.1811 12.3705 27.9574 11.6437 27.5065 11.1485C27.0555 10.6568 26.2992 10.4109 25.2341 10.4109C24.2506 10.4109 23.4588 10.5998 22.8516 10.9774C22.2445 11.3551 21.7225 11.8468 21.2858 12.4561L18.7471 10.19C19.2904 9.26722 20.1425 8.50831 21.3036 7.90974C22.4646 7.31116 23.9523 7.01188 25.7702 7.01188C27.9858 7.01188 29.7149 7.52138 30.9576 8.53682C32.2003 9.55582 32.8217 11.0914 32.8217 13.1437V20.2518H34.6076V23.6188H31.9411V23.6223ZM25.266 20.9501C26.0827 20.9501 26.7715 20.7506 27.336 20.3515C27.9006 19.9525 28.1811 19.3753 28.1811 18.62V16.671H25.7063C23.8032 16.671 22.8552 17.3124 22.8552 18.5914V19.2221C22.8552 19.7886 23.0753 20.2197 23.512 20.5119C23.9488 20.804 24.5346 20.9501 25.266 20.9501Z" fill="white" />
                                        <path d="M37.5227 23.6223V7.39311H42.1633V10.3504H42.3515C42.5397 9.89074 42.7705 9.45962 43.0403 9.06057C43.3101 8.66152 43.6404 8.31235 44.0274 8.00594C44.4144 7.70309 44.8618 7.46081 45.3766 7.28266C45.8879 7.10451 46.4666 7.01544 47.1164 7.01544C47.8904 7.01544 48.6005 7.14727 49.2467 7.40736C49.8929 7.67102 50.4468 8.06295 50.9084 8.5867C51.3664 9.11045 51.7286 9.75178 51.9913 10.5071C52.2505 11.2625 52.3819 12.1318 52.3819 13.1188V23.6223H47.7413V13.7458C47.7413 11.6473 46.8323 10.5998 45.0144 10.5998C44.6594 10.5998 44.3079 10.6461 43.9635 10.7423C43.619 10.8385 43.3101 10.9846 43.0403 11.1841C42.7669 11.3836 42.5539 11.6295 42.3976 11.9216C42.2414 12.2138 42.1633 12.5629 42.1633 12.9584V23.6223H37.5227Z" fill="white" />
                                        <path d="M66.6127 20.6366H66.3926C65.9736 21.6306 65.3948 22.4394 64.6528 23.0629C63.9107 23.6865 62.8917 24 61.5957 24C60.6974 24 59.8772 23.8325 59.1351 23.4976C58.3931 23.1627 57.7575 22.6496 57.2214 21.9549C56.6852 21.2601 56.2698 20.3836 55.968 19.3112C55.6662 18.2423 55.5135 16.9739 55.5135 15.5059C55.5135 14.038 55.6662 12.7696 55.968 11.7007C56.2698 10.6318 56.6888 9.75178 57.2214 9.05701C57.754 8.36223 58.3931 7.85273 59.1351 7.51425C59.8772 7.17934 60.6974 7.01188 61.5957 7.01188C62.2419 7.01188 62.8171 7.09739 63.3213 7.26485C63.8255 7.4323 64.2658 7.66746 64.6528 7.96318C65.0398 8.25891 65.3735 8.61164 65.6576 9.02494C65.9381 9.43824 66.1866 9.88717 66.3926 10.3753H66.6127V0.345606H71.2533V23.6223H66.6127V20.6366ZM63.6018 20.3515C64.4184 20.3515 65.1214 20.1556 65.7179 19.7565C66.3144 19.361 66.6127 18.734 66.6127 17.8824V13.133C66.6127 12.2779 66.3144 11.6544 65.7179 11.2589C65.1214 10.8634 64.4184 10.6639 63.6018 10.6639C62.5579 10.6639 61.7519 10.981 61.1874 11.6188C60.6228 12.253 60.3423 13.133 60.3423 14.2589V16.7601C60.3423 17.886 60.6228 18.766 61.1874 19.4002C61.7519 20.0344 62.5579 20.3515 63.6018 20.3515Z" fill="white" />
                                        <path d="M76.0466 19.9739H81.1879V11.0416H76.0466V7.39311H85.825V19.9739H90.5899V23.6223H76.0466V19.9739ZM83.5064 5.31591C82.4625 5.31591 81.7347 5.10214 81.3264 4.67102C80.918 4.2399 80.7157 3.72328 80.7157 3.11401V2.2019C80.7157 1.57126 80.918 1.04751 81.3264 0.630641C81.7347 0.210214 82.4625 0 83.5064 0C84.5503 0 85.2782 0.210214 85.6865 0.630641C86.0948 1.05107 86.2972 1.57482 86.2972 2.2019V3.11401C86.2972 3.72328 86.0948 4.2399 85.6865 4.67102C85.2782 5.10214 84.5503 5.31591 83.5064 5.31591Z" fill="white" />
                                        <path d="M101.124 24C99.3279 24 97.7656 23.7256 96.4377 23.1805C95.1098 22.6354 94.112 21.8907 93.4445 20.9466L96.0471 18.5238C96.6756 19.215 97.4106 19.7565 98.2556 20.1449C99.1006 20.5333 100.07 20.7257 101.156 20.7257C102.076 20.7257 102.797 20.5831 103.319 20.3017C103.841 20.0202 104.103 19.5819 104.103 18.9976C104.103 18.538 103.926 18.2173 103.571 18.0392C103.216 17.861 102.726 17.7185 102.097 17.6152L99.4947 17.2055C98.7633 17.1021 98.0852 16.9382 97.4567 16.7173C96.8283 16.4964 96.285 16.1971 95.827 15.8195C95.3654 15.4418 94.9997 14.9822 94.7298 14.4371C94.4564 13.8919 94.3215 13.2328 94.3215 12.4561C94.3215 10.7565 94.9677 9.42755 96.2637 8.462C97.5597 7.49644 99.3776 7.01544 101.717 7.01544C103.305 7.01544 104.657 7.22922 105.776 7.66033C106.894 8.09145 107.785 8.70428 108.456 9.49881L106.138 12.1425C105.659 11.6188 105.041 11.177 104.288 10.8207C103.535 10.4644 102.626 10.2862 101.561 10.2862C99.7646 10.2862 98.8663 10.8314 98.8663 11.9216C98.8663 12.4026 99.0438 12.734 99.3989 12.9121C99.7539 13.0903 100.244 13.2328 100.872 13.3361L103.443 13.7458C104.174 13.8492 104.853 14.0131 105.481 14.234C106.109 14.4549 106.656 14.7542 107.129 15.1318C107.597 15.5095 107.97 15.9691 108.24 16.5142C108.51 17.0594 108.648 17.7221 108.648 18.4952C108.648 20.1948 107.995 21.5344 106.688 22.5214C105.382 23.5083 103.525 24 101.124 24Z" fill="white" />
                                        <path d="M131.905 23.6223V1.66746H140.369C141.434 1.66746 142.386 1.83135 143.22 2.15558C144.055 2.47981 144.761 2.94656 145.336 3.55582C145.912 4.16508 146.345 4.89905 146.636 5.75772C146.927 6.61639 147.076 7.58195 147.076 8.65083C147.076 9.71972 146.931 10.6853 146.636 11.5439C146.341 12.4026 145.908 13.1366 145.336 13.7458C144.761 14.3551 144.055 14.8219 143.22 15.1461C142.386 15.4703 141.434 15.6342 140.369 15.6342H136.637V23.6223H131.905ZM136.637 11.829H139.176C140.284 11.829 141.051 11.6188 141.481 11.1983C141.91 10.7779 142.123 10.0867 142.123 9.12114V8.17696C142.123 7.2114 141.91 6.52019 141.481 6.09976C141.051 5.67934 140.284 5.46912 139.176 5.46912H136.637V11.829Z" fill="white" />
                                        <path d="M150.652 19.9739H154.383V11.0416H150.652V7.39311H159.02V11.9857H159.241C159.386 11.3979 159.592 10.8278 159.851 10.272C160.114 9.71615 160.448 9.22447 160.856 8.79335C161.264 8.36223 161.758 8.02375 162.344 7.77078C162.93 7.51781 163.618 7.39311 164.414 7.39311H165.951V11.6722H162.504C161.353 11.6722 160.487 12.0107 159.901 12.6912C159.315 13.3717 159.024 14.2019 159.024 15.1817V19.9774H164.353V23.6223H150.652V19.9739Z" fill="white" />
                                        <path d="M176.543 24C175.289 24 174.16 23.8076 173.155 23.4192C172.151 23.0309 171.302 22.4715 170.599 21.7375C169.899 21.0036 169.36 20.1128 168.983 19.0653C168.607 18.0178 168.419 16.8314 168.419 15.5095C168.419 14.1876 168.607 13.0047 168.983 11.9537C169.36 10.9062 169.896 10.0154 170.599 9.28147C171.298 8.54751 172.151 7.98812 173.155 7.59976C174.16 7.2114 175.286 7.019 176.543 7.019C177.796 7.019 178.925 7.2114 179.926 7.59976C180.931 7.98812 181.78 8.54751 182.483 9.28147C183.182 10.0154 183.722 10.9062 184.098 11.9537C184.475 13.0012 184.663 14.1876 184.663 15.5095C184.663 16.8314 184.475 18.0142 184.098 19.0653C183.722 20.1128 183.182 21.0036 182.483 21.7375C181.783 22.4715 180.931 23.0344 179.926 23.4192C178.925 23.8076 177.796 24 176.543 24ZM176.543 20.5404C177.587 20.5404 178.403 20.2162 178.989 19.5641C179.575 18.9157 179.866 17.9929 179.866 16.7957V14.2162C179.866 13.0226 179.575 12.0998 178.989 11.4477C178.403 10.7993 177.59 10.4715 176.543 10.4715C175.499 10.4715 174.682 10.7957 174.096 11.4477C173.51 12.0998 173.219 13.019 173.219 14.2162V16.7957C173.219 17.9893 173.51 18.9157 174.096 19.5641C174.682 20.2162 175.499 20.5404 176.543 20.5404Z" fill="white" />
                                        <path d="M196.604 23.6223C194.931 23.6223 193.688 23.1841 192.872 22.304C192.055 21.424 191.65 20.3052 191.65 18.9477V11.0416H187.262V7.39311H190.113C190.802 7.39311 191.292 7.25772 191.587 6.98337C191.878 6.71259 192.027 6.20665 192.027 5.47268V1.66746H196.291V7.39311H202.593V11.0416H196.291V19.9739H202.593V23.6223H196.604Z" fill="white" />
                                        <path d="M214.158 24C212.904 24 211.775 23.8076 210.77 23.4192C209.766 23.0309 208.917 22.4715 208.214 21.7375C207.514 21.0036 206.975 20.1128 206.598 19.0653C206.222 18.0178 206.034 16.8314 206.034 15.5095C206.034 14.1876 206.222 13.0047 206.598 11.9537C206.975 10.9062 207.511 10.0154 208.214 9.28147C208.913 8.54751 209.766 7.98812 210.77 7.59976C211.775 7.2114 212.901 7.019 214.158 7.019C215.411 7.019 216.54 7.2114 217.541 7.59976C218.546 7.98812 219.395 8.54751 220.098 9.28147C220.797 10.0154 221.337 10.9062 221.713 11.9537C222.09 13.0012 222.278 14.1876 222.278 15.5095C222.278 16.8314 222.09 18.0142 221.713 19.0653C221.337 20.1128 220.797 21.0036 220.098 21.7375C219.398 22.4715 218.546 23.0344 217.541 23.4192C216.54 23.8076 215.411 24 214.158 24ZM214.158 20.5404C215.202 20.5404 216.018 20.2162 216.604 19.5641C217.19 18.9157 217.481 17.9929 217.481 16.7957V14.2162C217.481 13.0226 217.19 12.0998 216.604 11.4477C216.018 10.7993 215.205 10.4715 214.158 10.4715C213.114 10.4715 212.297 10.7957 211.711 11.4477C211.125 12.0998 210.834 13.019 210.834 14.2162V16.7957C210.834 17.9893 211.125 18.9157 211.711 19.5641C212.297 20.2162 213.114 20.5404 214.158 20.5404Z" fill="white" />
                                        <path d="M233.626 24C232.351 24 231.208 23.8076 230.192 23.4192C229.177 23.0309 228.321 22.4715 227.621 21.7375C226.922 21.0036 226.382 20.1128 226.006 19.0653C225.63 18.0178 225.441 16.8314 225.441 15.5095C225.441 14.1876 225.63 13.0047 226.006 11.9537C226.382 10.9062 226.918 10.0154 227.621 9.28147C228.321 8.54751 229.177 7.98812 230.192 7.59976C231.204 7.2114 232.34 7.019 233.594 7.019C235.369 7.019 236.796 7.38242 237.872 8.1057C238.948 8.82898 239.768 9.78741 240.333 10.9846L236.761 12.9335C236.466 12.3028 236.086 11.7791 235.617 11.3622C235.149 10.9418 234.474 10.7316 233.597 10.7316C232.532 10.7316 231.712 11.0416 231.137 11.658C230.561 12.2779 230.274 13.1188 230.274 14.1912V16.8349C230.274 17.9038 230.561 18.7482 231.137 19.3682C231.712 19.9881 232.553 20.2945 233.661 20.2945C234.559 20.2945 235.266 20.0843 235.777 19.6639C236.288 19.2435 236.722 18.6983 237.077 18.0285L240.588 20.0416C240.002 21.2352 239.15 22.1971 238.032 22.9204C236.91 23.6401 235.443 24 233.626 24Z" fill="white" />
                                        <path d="M251.773 24C250.519 24 249.39 23.8076 248.385 23.4192C247.381 23.0309 246.532 22.4715 245.829 21.7375C245.129 21.0036 244.59 20.1128 244.213 19.0653C243.837 18.0178 243.649 16.8314 243.649 15.5095C243.649 14.1876 243.837 13.0047 244.213 11.9537C244.59 10.9062 245.126 10.0154 245.829 9.28147C246.528 8.54751 247.381 7.98812 248.385 7.59976C249.39 7.2114 250.516 7.019 251.773 7.019C253.026 7.019 254.155 7.2114 255.156 7.59976C256.161 7.98812 257.01 8.54751 257.713 9.28147C258.412 10.0154 258.952 10.9062 259.328 11.9537C259.705 13.0012 259.893 14.1876 259.893 15.5095C259.893 16.8314 259.705 18.0142 259.328 19.0653C258.952 20.1128 258.412 21.0036 257.713 21.7375C257.013 22.4715 256.161 23.0344 255.156 23.4192C254.155 23.8076 253.03 24 251.773 24ZM251.773 20.5404C252.816 20.5404 253.633 20.2162 254.219 19.5641C254.805 18.9157 255.096 17.9929 255.096 16.7957V14.2162C255.096 13.0226 254.805 12.0998 254.219 11.4477C253.633 10.7993 252.82 10.4715 251.773 10.4715C250.729 10.4715 249.912 10.7957 249.326 11.4477C248.74 12.0998 248.449 13.019 248.449 14.2162V16.7957C248.449 17.9893 248.74 18.9157 249.326 19.5641C249.916 20.2162 250.729 20.5404 251.773 20.5404Z" fill="white" />
                                        <path d="M263.309 19.9739H268.262V3.99406H206.041V0.345606H271.123C272.107 0.345606 272.902 1.14371 272.902 2.13064V19.9739H277.855V23.6223H263.312V19.9739H263.309Z" fill="white" />
                                    </svg>
                                </div>
                                <div className="logo-img">
                                    <svg width="173" height="21" viewBox="0 0 173 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.44 17V5.832H8.48V7H2.784V10.76H8V11.928H2.784V17H1.44ZM14.9058 6.92C14.5324 6.92 14.2711 6.84533 14.1218 6.696C13.9724 6.536 13.8978 6.33867 13.8978 6.104V5.848C13.8978 5.61333 13.9724 5.42133 14.1218 5.272C14.2711 5.112 14.5324 5.032 14.9058 5.032C15.2791 5.032 15.5404 5.112 15.6898 5.272C15.8391 5.42133 15.9138 5.61333 15.9138 5.848V6.104C15.9138 6.33867 15.8391 6.536 15.6898 6.696C15.5404 6.84533 15.2791 6.92 14.9058 6.92ZM11.2898 15.912H14.2658V9.832H11.2898V8.744H15.5458V15.912H18.3298V17H11.2898V15.912ZM24.3875 17C23.7582 17 23.2942 16.824 22.9955 16.472C22.7075 16.12 22.5635 15.6667 22.5635 15.112V9.832H19.8115V8.744H21.8595C22.1368 8.744 22.3288 8.69067 22.4355 8.584C22.5528 8.46667 22.6115 8.26933 22.6115 7.992V5.832H23.8435V8.744H27.6035V9.832H23.8435V15.912H27.6035V17H24.3875ZM43.687 6.92C43.3137 6.92 43.0523 6.84533 42.903 6.696C42.7537 6.536 42.679 6.33867 42.679 6.104V5.848C42.679 5.61333 42.7537 5.42133 42.903 5.272C43.0523 5.112 43.3137 5.032 43.687 5.032C44.0603 5.032 44.3217 5.112 44.471 5.272C44.6203 5.42133 44.695 5.61333 44.695 5.848V6.104C44.695 6.33867 44.6203 6.536 44.471 6.696C44.3217 6.84533 44.0603 6.92 43.687 6.92ZM40.071 15.912H43.047V9.832H40.071V8.744H44.327V15.912H47.111V17H40.071V15.912ZM49.5368 17V8.744H50.8168V10.088H50.8808C50.9661 9.88533 51.0728 9.69333 51.2008 9.512C51.3288 9.32 51.4834 9.15467 51.6648 9.016C51.8568 8.87733 52.0808 8.76533 52.3368 8.68C52.5928 8.59467 52.8914 8.552 53.2328 8.552C54.0968 8.552 54.7901 8.82933 55.3128 9.384C55.8354 9.928 56.0968 10.7013 56.0968 11.704V17H54.8168V11.928C54.8168 11.1707 54.6514 10.6107 54.3208 10.248C53.9901 9.87467 53.5048 9.688 52.8648 9.688C52.6088 9.688 52.3581 9.72 52.1128 9.784C51.8674 9.848 51.6488 9.944 51.4568 10.072C51.2648 10.2 51.1101 10.3653 50.9928 10.568C50.8754 10.7707 50.8168 11.0053 50.8168 11.272V17H49.5368ZM74.6283 8.744H75.9083L71.8123 18.808C71.7163 19.0427 71.6096 19.2453 71.4923 19.416C71.3749 19.5973 71.2363 19.7413 71.0763 19.848C70.9163 19.9653 70.7243 20.0507 70.5003 20.104C70.2763 20.168 70.0096 20.2 69.7003 20.2H68.4843V19.112H70.4043L71.3323 16.84L68.0043 8.744H69.3163L70.7083 12.2L71.9403 15.336H72.0043L73.2363 12.2L74.6283 8.744ZM81.55 17.192C80.974 17.192 80.4513 17.0907 79.982 16.888C79.5233 16.6853 79.1287 16.3973 78.798 16.024C78.478 15.64 78.2327 15.1867 78.062 14.664C77.8913 14.1307 77.806 13.5333 77.806 12.872C77.806 12.2213 77.8913 11.6293 78.062 11.096C78.2327 10.5627 78.478 10.1093 78.798 9.736C79.1287 9.352 79.5233 9.05867 79.982 8.856C80.4513 8.65333 80.974 8.552 81.55 8.552C82.126 8.552 82.6433 8.65333 83.102 8.856C83.5713 9.05867 83.966 9.352 84.286 9.736C84.6167 10.1093 84.8673 10.5627 85.038 11.096C85.2087 11.6293 85.294 12.2213 85.294 12.872C85.294 13.5333 85.2087 14.1307 85.038 14.664C84.8673 15.1867 84.6167 15.64 84.286 16.024C83.966 16.3973 83.5713 16.6853 83.102 16.888C82.6433 17.0907 82.126 17.192 81.55 17.192ZM81.55 16.088C82.2647 16.088 82.8407 15.8747 83.278 15.448C83.7153 15.0213 83.934 14.36 83.934 13.464V12.28C83.934 11.384 83.7153 10.7227 83.278 10.296C82.8407 9.86933 82.2647 9.656 81.55 9.656C80.8353 9.656 80.2593 9.86933 79.822 10.296C79.3847 10.7227 79.166 11.384 79.166 12.28V13.464C79.166 14.36 79.3847 15.0213 79.822 15.448C80.2593 15.8747 80.8353 16.088 81.55 16.088ZM93.0958 15.656H93.0318C92.9464 15.8587 92.8398 16.056 92.7118 16.248C92.5838 16.4293 92.4238 16.5893 92.2318 16.728C92.0504 16.8667 91.8318 16.9787 91.5758 17.064C91.3198 17.1493 91.0211 17.192 90.6798 17.192C89.8158 17.192 89.1224 16.92 88.5998 16.376C88.0771 15.8213 87.8158 15.0427 87.8158 14.04V8.744H89.0958V13.816C89.0958 14.5733 89.2611 15.1387 89.5918 15.512C89.9224 15.8747 90.4078 16.056 91.0477 16.056C91.3038 16.056 91.5544 16.024 91.7998 15.96C92.0451 15.896 92.2638 15.8 92.4558 15.672C92.6478 15.544 92.8024 15.384 92.9198 15.192C93.0371 14.9893 93.0958 14.7493 93.0958 14.472V8.744H94.3758V17H93.0958V15.656ZM97.1695 15.912H99.5855V9.832H97.1695V8.744H100.866V10.824H100.946C101.116 10.1733 101.436 9.66667 101.906 9.304C102.386 8.93067 102.994 8.744 103.73 8.744H104.882V10.024H103.33C102.594 10.024 101.996 10.2373 101.538 10.664C101.09 11.0907 100.866 11.6507 100.866 12.344V15.912H104.066V17H97.1695V15.912ZM120.213 17.192C119.616 17.192 119.082 17.0907 118.613 16.888C118.154 16.6747 117.765 16.3813 117.445 16.008C117.125 15.6347 116.88 15.1813 116.709 14.648C116.549 14.1147 116.469 13.5227 116.469 12.872C116.469 12.2213 116.554 11.6293 116.725 11.096C116.896 10.5627 117.141 10.1093 117.461 9.736C117.781 9.352 118.17 9.05867 118.629 8.856C119.088 8.65333 119.61 8.552 120.197 8.552C120.997 8.552 121.648 8.728 122.149 9.08C122.65 9.432 123.018 9.89067 123.253 10.456L122.229 11C122.08 10.5733 121.829 10.2427 121.477 10.008C121.136 9.77333 120.709 9.656 120.197 9.656C119.824 9.656 119.488 9.72 119.189 9.848C118.901 9.96533 118.656 10.136 118.453 10.36C118.25 10.584 118.096 10.8507 117.989 11.16C117.893 11.4693 117.845 11.8053 117.845 12.168V13.576C117.845 13.9387 117.893 14.2747 117.989 14.584C118.096 14.8933 118.25 15.16 118.453 15.384C118.656 15.608 118.906 15.784 119.205 15.912C119.504 16.0293 119.845 16.088 120.229 16.088C120.784 16.088 121.242 15.96 121.605 15.704C121.968 15.448 122.256 15.096 122.469 14.648L123.381 15.272C123.136 15.8267 122.752 16.2853 122.229 16.648C121.717 17.0107 121.045 17.192 120.213 17.192ZM126.287 5.16H127.567V10.088H127.631C127.716 9.88533 127.823 9.69333 127.951 9.512C128.079 9.32 128.233 9.15467 128.415 9.016C128.607 8.87733 128.831 8.76533 129.087 8.68C129.343 8.59467 129.641 8.552 129.983 8.552C130.847 8.552 131.54 8.82933 132.063 9.384C132.585 9.928 132.847 10.7013 132.847 11.704V17H131.567V11.928C131.567 11.1707 131.401 10.6107 131.071 10.248C130.74 9.87467 130.255 9.688 129.615 9.688C129.359 9.688 129.108 9.72 128.863 9.784C128.617 9.848 128.399 9.944 128.207 10.072C128.015 10.2 127.86 10.3653 127.743 10.568C127.625 10.7707 127.567 11.0053 127.567 11.272V17H126.287V5.16ZM142.233 17C141.731 17 141.374 16.872 141.161 16.616C140.947 16.36 140.814 16.04 140.761 15.656H140.681C140.499 16.136 140.206 16.5147 139.801 16.792C139.406 17.0587 138.873 17.192 138.201 17.192C137.337 17.192 136.649 16.968 136.137 16.52C135.625 16.072 135.368 15.4587 135.368 14.68C135.368 13.912 135.646 13.32 136.201 12.904C136.766 12.488 137.673 12.28 138.921 12.28H140.681V11.464C140.681 10.856 140.51 10.4027 140.169 10.104C139.827 9.79467 139.342 9.64 138.713 9.64C138.158 9.64 137.705 9.752 137.353 9.976C137.001 10.1893 136.718 10.4827 136.505 10.856L135.641 10.216C135.747 10.0027 135.891 9.79467 136.073 9.592C136.254 9.38933 136.478 9.21333 136.745 9.064C137.011 8.904 137.315 8.78133 137.657 8.696C137.998 8.6 138.377 8.552 138.793 8.552C139.763 8.552 140.531 8.79733 141.097 9.288C141.673 9.77867 141.961 10.4613 141.961 11.336V15.88H143.113V17H142.233ZM138.424 16.12C138.755 16.12 139.054 16.0827 139.321 16.008C139.598 15.9227 139.838 15.816 140.041 15.688C140.243 15.5493 140.398 15.3893 140.505 15.208C140.622 15.016 140.681 14.8133 140.681 14.6V13.24H138.921C138.153 13.24 137.593 13.3467 137.241 13.56C136.889 13.7733 136.713 14.0827 136.713 14.488V14.824C136.713 15.2507 136.862 15.576 137.161 15.8C137.47 16.0133 137.891 16.12 138.424 16.12ZM149.218 6.92C148.845 6.92 148.584 6.84533 148.434 6.696C148.285 6.536 148.21 6.33867 148.21 6.104V5.848C148.21 5.61333 148.285 5.42133 148.434 5.272C148.584 5.112 148.845 5.032 149.218 5.032C149.592 5.032 149.853 5.112 150.002 5.272C150.152 5.42133 150.226 5.61333 150.226 5.848V6.104C150.226 6.33867 150.152 6.536 150.002 6.696C149.853 6.84533 149.592 6.92 149.218 6.92ZM145.602 15.912H148.578V9.832H145.602V8.744H149.858V15.912H152.642V17H145.602V15.912ZM155.068 17V8.744H156.348V10.088H156.412C156.497 9.88533 156.604 9.69333 156.732 9.512C156.86 9.32 157.015 9.15467 157.196 9.016C157.388 8.87733 157.612 8.76533 157.868 8.68C158.124 8.59467 158.423 8.552 158.764 8.552C159.628 8.552 160.321 8.82933 160.844 9.384C161.367 9.928 161.628 10.7013 161.628 11.704V17H160.348V11.928C160.348 11.1707 160.183 10.6107 159.852 10.248C159.521 9.87467 159.036 9.688 158.396 9.688C158.14 9.688 157.889 9.72 157.644 9.784C157.399 9.848 157.18 9.944 156.988 10.072C156.796 10.2 156.641 10.3653 156.524 10.568C156.407 10.7707 156.348 11.0053 156.348 11.272V17H155.068ZM167.894 17.144C167.456 17.144 167.147 17.0533 166.966 16.872C166.795 16.6907 166.71 16.4613 166.71 16.184V15.896C166.71 15.6187 166.795 15.3893 166.966 15.208C167.147 15.0267 167.456 14.936 167.894 14.936C168.331 14.936 168.635 15.0267 168.806 15.208C168.987 15.3893 169.078 15.6187 169.078 15.896V16.184C169.078 16.4613 168.987 16.6907 168.806 16.872C168.635 17.0533 168.331 17.144 167.894 17.144Z" fill="white" />
                                    </svg>

                                </div>
                            </div>
                        )}
                        <div className="full"></div>
                        <ConnectWalletButton />
                    </Toolbar>
                </AppBar>
                <div className="gradient-divider" style={isMobile ? { height: 0 } : {}}>
                    <svg width="100%" height="1" viewBox="0 0 1919 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line y1="0.5" x2="1919" y2="0.5" stroke="url(#paint0_linear_56_36)" />
                        <defs>
                            <linearGradient id="paint0_linear_56_36" x1="1890.56" y1="1" x2="20.4148" y2="1" gradientUnits="userSpaceOnUse">
                                <stop stop-color="white" stop-opacity="0" />
                                <stop offset="0.578125" stop-color="white" />
                                <stop offset="1" stop-color="white" stop-opacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>

                </div>
                <div className="AppContent">
                    {props.children}
                </div>
            </div>
        </div>
    )
}

export default Layout;
