import "../style.css"
import React from "react";
import DevAvatar from "data-base64:~assets/images/dev_avatar.png";
import Dropdown from './menu_dropdown';
import AccountDetailsIcon from "data-base64:~assets/icons/account_details.png";
import ConnectedSitesIcon from "data-base64:~assets/icons/connected_sites.png";
import SupportIcon from "data-base64:~assets/icons/support.png";
import SettingsIcon from "data-base64:~assets/icons/settings.png";
import LockUtilityIcon from "data-base64:~assets/icons/lock_utility.png";
// import ConnectToMobileWalletIcon from "data-base64:~assets/icons/connect_to_mobile_wallet.png";
import {useNavigate} from 'react-router-dom';

const HomeHeader = ({_handleAccountDetailsClick, _handleCoonectedSitesClick, _handleConnectToMobileWalletClick}) => {
    const navigate = useNavigate();

    const handleAccountDetailsClick = () => {
        _handleAccountDetailsClick();
    }

    const handleCoonectedSitesClick = () => {
        _handleCoonectedSitesClick();
    }

    // 需替换为帮助网页
    const handleSupportClick = () => {
        const blankPageUrl = 'about:blank';

        // 在新标签页中打开空白页面
        window.open(blankPageUrl, '_blank');
    }

    const handleSettingsClick = () => {
        navigate("/tabs/home.html#settings");
    }

    const handleLockUtilityClick = () => {

    }

    // const handleConnectToMobileWalletClick = () => {
    //     _handleConnectToMobileWalletClick();
    // }

    const options = [
        {
            value: '/tabs/home.html#account_details',
            label: 'account_details',
            icon: AccountDetailsIcon,
            handleClick: handleAccountDetailsClick
        },
        {
            value: '/tabs/home.html#connected_sites',
            label: 'connected_sites',
            icon: ConnectedSitesIcon,
            handleClick: handleCoonectedSitesClick
        },
        {value: '/tabs/home.html#support', label: 'support', icon: SupportIcon, handleClick: handleSupportClick},
        {value: '/tabs/home.html#settings', label: 'settings', icon: SettingsIcon, handleClick: handleSettingsClick},
        {
            value: '/tabs/home.html#lock_utility',
            label: 'lock_utility',
            icon: LockUtilityIcon,
            handleClick: handleLockUtilityClick
        },
        // { value: '/tabs/home.html#connect_to_mobile_wallet', label: 'connect_to_mobile_wallet', icon: ConnectToMobileWalletIcon, handleClick: handleConnectToMobileWalletClick },
    ];

    return (
        <div className="home_header">
            <div style={{width: "24px", height: "24px"}}></div>
            <div className="flex_center_center text_black_14_600">
                <img src={DevAvatar} style={{width: "30px", height: "30px", margin: "5px"}} alt={"Avatar"}/>
                Account 1
            </div>
            <Dropdown options={options}/>
            {/* <Link to="/tabs/home.html#settings">
                <img src={menuImg} style={{ width: "24px", height: "24px" }} onClick={handleMenuClick}/>
            </Link> */}
        </div>
    );
};

export default HomeHeader;
