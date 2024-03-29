import "../style.css"

import React, {useEffect, useState} from "react"
import {
    Link,
    Route,
    BrowserRouter as Router,
    Routes,
    useLocation
} from "react-router-dom"

import ConfirmTransaction from "~pages/confirm_transaction"
import GetPower from "~pages/get_power"
import SendPage from "~pages/send"
import AboutPage from "~pages/setting/about"
import AdvancedPage from "~pages/setting/advanced"
import GeneralPage from "~pages/setting/general"
import SecurityPrivacyPage from "~pages/setting/security_privacy"
import RevealSecretRecoveryPhrase from "~pages/setting/reveal_secret_recovery_phrase"
import AddCustomNetworkPage from "~pages/setting/add_custom_network"

import AccountDetailsDialog from "~compoments/account_details_dialog"
import ConnectToMobileWalletDialog from "~compoments/connect_to_mobile_wallet"
import ConnectedSitesDialog from "~compoments/connected_site_dialog"
import HomeHeader from "~compoments/home_header"
import MainPage from "~pages/main_page"
import SettingPage from "~pages/setting_page"

function Home() {
    const [showAccountDetailsDialog, setShowAccountDetailsDialog] =
        useState(false)
    const [showConnectedSitesDialog, setShowConnectedSitesDialog] =
        useState(false)
    const [showConnectToMobileWalletDialog, setShowConnectToMobileWalletDialog] =
        useState(false)

    const handleAccountDetailsClick = () => {
        setShowAccountDetailsDialog(true)
    }

    const handlConnectedSitesClick = () => {
        setShowConnectedSitesDialog(true)
    }

    const handlConnectToMobileWalletClick = () => {
        setShowConnectToMobileWalletDialog(true)
    }

    const handleDialogClose = () => {
        setShowAccountDetailsDialog(false)
        setShowConnectedSitesDialog(false)
        setShowConnectToMobileWalletDialog(false)
    }

    document.title = "Home"
    return (
        <div className="home_page">
            <Router>
                <HomeHeader
                    _handleAccountDetailsClick={handleAccountDetailsClick}
                    _handleCoonectedSitesClick={handlConnectedSitesClick}
                    _handleConnectToMobileWalletClick={handlConnectToMobileWalletClick}
                />
                <Routes>
                    <Route path="/popup.html" element={<MainPage/>}/>
                    <Route path="/tabs/*" element={<PageSelector/>}/>
                </Routes>
            </Router>
            {showAccountDetailsDialog && (
                <div className="overlay" onClick={handleDialogClose}>
                    <AccountDetailsDialog _onClose={handleDialogClose}/>
                </div>
            )}
            {showConnectedSitesDialog && (
                <div className="overlay" onClick={handleDialogClose}>
                    <ConnectedSitesDialog _onClose={handleDialogClose}/>
                </div>
            )}
            {showConnectToMobileWalletDialog && (
                <div className="overlay" onClick={handleDialogClose}>
                    <ConnectToMobileWalletDialog _onClose={handleDialogClose}/>
                </div>
            )}
        </div>
    )
}

const PageSelector = () => {
    const location = useLocation()

    // 根据完整路径决定显示哪个组件
    if (location.pathname === "/tabs/home.html") {
        // 考虑哈希部分
        switch (location.hash) {
            case "#send":
                return <SendPage/>
            case "#getPower":
                return <GetPower/>
            case "#settings":
                return <SettingPage/>
            case "#confirm":
                return <ConfirmTransaction/>
            case "#general":
                return <GeneralPage/>
            case "#advanced":
                return <AdvancedPage/>
            case "#security_privacy":
                return <SecurityPrivacyPage/>
            case "#about":
                return <AboutPage/>
            case "#reveal_srp":
                return <RevealSecretRecoveryPhrase/>
            case "#add_network":
                return <AddCustomNetworkPage/>
            // 添加其他哈希值对应的组件
            default:
                return <MainPage/>
        }
    }

    // 处理其他路径
    return null
}

export default Home
