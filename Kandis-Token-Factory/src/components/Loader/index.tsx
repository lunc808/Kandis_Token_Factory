import { useWallet, WalletStatus } from "@terra-money/wallet-provider";
import "./Loader.scss";

interface Props {
    position?: "fixed" | "absolute" | "relative";
}

function Loader(props: Props) {
    const position =  props.position ? props.position : "absolute";
    const { status } = useWallet()

    return (
        <div className="LoaderWrapper"  
            style={{position : position}}>
            <div className="Loader">
                <div style={{width:"57px"}}>
                    <svg width="51" height="51" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M48.0842 51H2.91585C1.30503 51 0 49.695 0 48.0842V2.91585C0 1.30503 1.30503 0 2.91585 0H48.0787C49.695 0 51 1.30503 51 2.91585V48.0787C51 49.695 49.695 51 48.0842 51Z" fill="#FAD64B"/>
                        <path d="M24.3535 25.5437C22.759 27.4166 20.2855 28.0718 18.0467 27.2528C17.0311 26.8814 16.1683 26.2207 15.5404 25.358C15.1636 25.8167 14.8633 26.3409 14.6504 26.9142C14.3446 27.7442 14.2463 28.6069 14.3337 29.4424C15.939 30.6164 17.9484 31.2989 20.1763 31.3317C22.628 31.3262 24.9541 30.4198 26.7287 28.465C25.9424 27.493 25.1507 26.5211 24.3535 25.5437ZM39.7954 6.21389C37.857 1.5398 32.1454 0.245688 28.0993 3.511C23.4962 7.22406 18.904 10.959 14.2845 14.6556C11.0465 17.2439 9.78515 21.219 11.0629 24.9812C11.1175 25.145 11.1776 25.3034 11.2431 25.4617C11.9038 23.7253 13.0232 22.2565 14.4756 21.2026C14.6613 19.9031 15.322 18.6581 16.5014 17.6971C21.181 13.8857 25.8769 10.0908 30.5783 6.30672C32.2055 4.99622 34.2095 5.09451 35.6073 6.50329C36.9833 7.89023 37.0543 9.89965 35.7384 11.5378C32.899 15.0488 30.0432 18.5489 27.1929 22.0599C27.0509 22.2347 26.9089 22.4094 26.767 22.5896C26.9362 22.7698 27.1 22.9609 27.2584 23.1575C27.8973 23.9547 28.5361 24.7464 29.175 25.5437C32.4458 21.5685 35.6783 17.566 38.8672 13.5308C40.5926 11.3357 40.8711 8.79665 39.7954 6.21389Z" fill="white"/>
                        <path d="M38.3975 36.9723C35.3233 33.1609 32.2382 29.355 29.1695 25.5437C28.4487 26.4228 27.7225 27.2965 27.0017 28.1701C26.9143 28.2739 26.8269 28.3776 26.7396 28.4759C29.7046 32.1289 32.6586 35.7928 35.6072 39.4567C36.9177 41.0839 36.8195 43.0879 35.4107 44.4858C34.0237 45.8618 32.0143 45.9328 30.3762 44.6168C26.8597 41.7774 23.3596 38.9216 19.8486 36.0713C18.6964 35.1376 17.5279 34.2148 16.3921 33.2592C15.1963 32.2545 14.4865 30.8894 14.3336 29.4533C12.963 28.4486 11.8873 27.0835 11.2375 25.4618C10.8171 26.5648 10.5823 27.777 10.5659 29.0547C10.5714 31.6266 11.5706 34.0728 13.7384 35.8693C18.5708 39.8827 23.4524 43.836 28.3777 47.7292C30.5673 49.4602 33.1064 49.7387 35.6891 48.6684C40.3687 46.7245 41.6628 41.0184 38.3975 36.9723Z" fill="black"/>
                        <path d="M26.7668 22.5842C25.9751 23.567 25.1942 24.5499 24.3806 25.5109C24.3697 25.5219 24.3643 25.5328 24.3533 25.5437C24.3097 25.4891 24.2605 25.429 24.2168 25.3744C23.1029 24.0093 21.6068 23.3377 20.0888 23.294C18.2159 23.2995 16.5887 24.0912 15.5403 25.3635C14.8304 24.397 14.4209 23.1739 14.4209 21.8197C14.4264 21.6122 14.4427 21.4047 14.4755 21.2027C15.2127 20.6676 16.0372 20.2417 16.9272 19.9359C20.4655 18.7346 24.1786 19.7721 26.7668 22.5842Z" fill="black"/>
                        <path d="M29.1695 25.5382C28.4487 26.4174 27.7225 27.291 27.0017 28.1647C26.9143 28.2684 26.827 28.3722 26.7396 28.4705C25.9479 27.4931 25.1561 26.5211 24.3589 25.5437C24.3698 25.5328 24.3753 25.5219 24.3862 25.5109C25.1943 24.5499 25.9806 23.5616 26.7724 22.5842C26.9416 22.7644 27.1055 22.9555 27.2638 23.152C27.8918 23.9493 28.5306 24.7465 29.1695 25.5382Z" fill="white"/>
                        <path d="M14.6559 26.9197C14.3501 27.7497 14.2518 28.6124 14.3392 29.4479C12.9686 28.4432 11.8929 27.0781 11.2432 25.4563C11.9039 23.7199 13.0233 22.2511 14.4757 21.1972C14.443 21.4047 14.4266 21.6068 14.4211 21.8143C14.4211 23.163 14.8361 24.3861 15.5405 25.358C15.1637 25.8222 14.8634 26.3464 14.6559 26.9197Z" fill="black"/>
                    </svg>
                </div>

                {/* <div className="LoaderAnimation">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div> */}
                {status === WalletStatus.WALLET_NOT_CONNECTED 
                    ? <h2>Connect wallet to visualize this page</h2>
                    : <h2>Loading...</h2> 
                }
            </div>
        </div>
    );
}

export default Loader;