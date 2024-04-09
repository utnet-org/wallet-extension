import "../style.css"

import React, { useEffect, useState } from "react"
import {
  Link,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation
} from "react-router-dom"

import { Storage } from "@plasmohq/storage"

import AccountDetailsDialog from "~compoments/account_details_dialog"
import ConnectToMobileWalletDialog from "~compoments/connect_to_mobile_wallet"
import ConnectedSitesDialog from "~compoments/connected_site_dialog"
import HomeHeader from "~compoments/home_header"
import TopStorage from "~db/user_storage"
import ConfirmTransaction from "~pages/confirm_transaction"
import GetPower from "~pages/get_power"
import MainPage from "~pages/main_page"
import SendPage from "~pages/send"
import SettingPage from "~pages/setting_page"
import AboutPage from "~pages/setting/about"
import AddCustomNetworkPage from "~pages/setting/add_custom_network"
import AdvancedPage from "~pages/setting/advanced"
import GeneralPage from "~pages/setting/general"
import RevealSecretRecoveryPhrase from "~pages/setting/reveal_secret_recovery_phrase"
import SecurityPrivacyPage from "~pages/setting/security_privacy"

import LockPage from "./lock_page"

function Home() {
  const storage = new Storage({
    area: "local"
  })
  const [showAccountDetailsDialog, setShowAccountDetailsDialog] =
    useState(false)
  const [showConnectedSitesDialog, setShowConnectedSitesDialog] =
    useState(false)
  const [showConnectToMobileWalletDialog, setShowConnectToMobileWalletDialog] =
    useState(false)
  const [isLock, setIsLock] = useState(false)
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
  useEffect(() => {
    const checkCurrentLanguage = async () => {
      const nowTime = new Date().getTime()
      const stroageLockTime = await TopStorage.getLockTime()
      if (
        stroageLockTime === undefined ||
        stroageLockTime === null ||
        stroageLockTime === "" ||
        stroageLockTime === "0" ||
        Number(stroageLockTime) > nowTime
      ) {
        setIsLock(false)
      } else {
        setIsLock(true)
      }
    }
    checkCurrentLanguage()
  }, [storage])
  const PageSelector = () => {
    const location = useLocation()

    // 根据完整路径决定显示哪个组件
    if (location.pathname === "/tabs/home.html") {
      // 考虑哈希部分
      switch (location.hash) {
        case "#send":
          return <SendPage />
        case "#getPower":
          return <GetPower />
        case "#settings":
          return <SettingPage />
        case "#confirm":
          return <ConfirmTransaction />
        case "#general":
          return <GeneralPage />
        case "#advanced":
          return <AdvancedPage />
        case "#security_privacy":
          return <SecurityPrivacyPage />
        case "#about":
          return <AboutPage />
        case "#reveal_srp":
          return <RevealSecretRecoveryPhrase />
        case "#add_network":
          return <AddCustomNetworkPage />
        case "#lock_page":
          return <LockPage />
        // 添加其他哈希值对应的组件
        default:
          return <MainPage isLock={isLock} setIsLock={setIsLock} />
      }
    }

    // 处理其他路径
    return null
  }
  document.title = "Home"
  return (
    <div className="home_page">
      <Router>
        <HomeHeader
          isLock={isLock} // Pass isLock and setIsLock to HomeHeader
          setIsLock={setIsLock}
          _handleAccountDetailsClick={handleAccountDetailsClick}
          _handleCoonectedSitesClick={handlConnectedSitesClick}
          _handleConnectToMobileWalletClick={handlConnectToMobileWalletClick}
        />
        <Routes>
          <Route
            path="/popup.html"
            element={<MainPage isLock={isLock} setIsLock={setIsLock} />}
          />
          <Route path="/tabs/*" element={<PageSelector />} />
        </Routes>
      </Router>
      {showAccountDetailsDialog && (
        <div className="overlay" onClick={handleDialogClose}>
          <AccountDetailsDialog _onClose={handleDialogClose} />
        </div>
      )}
      {showConnectedSitesDialog && (
        <div className="overlay" onClick={handleDialogClose}>
          <ConnectedSitesDialog _onClose={handleDialogClose} />
        </div>
      )}
      {showConnectToMobileWalletDialog && (
        <div className="overlay" onClick={handleDialogClose}>
          <ConnectToMobileWalletDialog _onClose={handleDialogClose} />
        </div>
      )}
    </div>
  )
}

export default Home
