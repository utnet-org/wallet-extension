import "../style.css"

import AccountDetailsIcon from "data-base64:~assets/icons/account_details.png"
import ConnectedSitesIcon from "data-base64:~assets/icons/connected_sites.png"
import LockUtilityIcon from "data-base64:~assets/icons/lock_utility.png"
import SettingsIcon from "data-base64:~assets/icons/settings.png"
import SupportIcon from "data-base64:~assets/icons/support.png"
import React, { useEffect, useState } from "react"
// import ConnectToMobileWalletIcon from "data-base64:~assets/icons/connect_to_mobile_wallet.png";
import { useNavigate } from "react-router-dom"

import { Storage } from "@plasmohq/storage"

import TopStorage from "~db/user_storage"
import LockPage from "~tabs/lock_page"
import IdenticonAvatar from "~utils/identiconAvatar"

import Dropdown from "./menu_dropdown"

const HomeHeader = ({
  _handleAccountDetailsClick,
  _handleCoonectedSitesClick,
  _handleConnectToMobileWalletClick,
  isLock,
  setIsLock
}) => {
  const storage = new Storage({
    area: "local"
  })
  const navigate = useNavigate()

  const handleAccountDetailsClick = () => {
    _handleAccountDetailsClick()
  }

  const [currentAddress, setCurrentAddress] = useState(
    "0x010101011010101001010101101010100101010110101010"
  )

  useEffect(() => {
    const checkCurrentAddress = async () => {
      const myAddress = await TopStorage.getMyAddress()
      if (myAddress !== undefined) {
        setCurrentAddress(myAddress)
      }
    }
    checkCurrentAddress()
  }, [])

  const handleCoonectedSitesClick = () => {
    _handleCoonectedSitesClick()
  }

  // 需替换为帮助网页
  const handleSupportClick = () => {
    const blankPageUrl = "https://utlab.io/"

    // 在新标签页中打开空白页面
    window.open(blankPageUrl, "_blank")
  }

  const handleSettingsClick = () => {
    navigate("/tabs/home.html#settings")
  }

  const handleLockUtilityClick = async () => {
    await setIsLock(true)
    await TopStorage.setLockTime(new Date().getTime())
    await TopStorage.setLockStatus(true)
    navigate("/tabs/home.html")
  }

  // const handleConnectToMobileWalletClick = () => {
  //     _handleConnectToMobileWalletClick();
  // }

  const options = [
    {
      value: "/tabs/home.html#account_details",
      label: "account_details",
      icon: AccountDetailsIcon,
      handleClick: handleAccountDetailsClick
    },
    {
      value: "/tabs/home.html#connected_sites",
      label: "connected_sites",
      icon: ConnectedSitesIcon,
      handleClick: handleCoonectedSitesClick
    },
    {
      value: "/tabs/home.html#support",
      label: "support",
      icon: SupportIcon,
      handleClick: handleSupportClick
    },
    {
      value: "/tabs/home.html#settings",
      label: "settings",
      icon: SettingsIcon,
      handleClick: handleSettingsClick
    },
    {
      value: "/tabs/home.html#lock_utility",
      label: "lock_utility",
      icon: LockUtilityIcon,
      handleClick: handleLockUtilityClick
    }
    // { value: '/tabs/home.html#connect_to_mobile_wallet', label: 'connect_to_mobile_wallet', icon: ConnectToMobileWalletIcon, handleClick: handleConnectToMobileWalletClick },
  ]
  useEffect(() => {
    const checkCurrentLanguage = async () => {}
    checkCurrentLanguage()
  }, [storage])
  return (
    <div>
      {!isLock && (
        <div className="home_header">
          <div style={{ width: "24px", height: "24px" }}></div>
          <div className="flex_center_center text_black_14_600">
            <IdenticonAvatar
              address={currentAddress}
              size={30}></IdenticonAvatar>
            <div style={{ marginLeft: "5px" }}>Account 1</div>
          </div>
          <Dropdown options={options} />
          {/* <Link to="/tabs/home.html#settings">
                <img src={menuImg} style={{ width: "24px", height: "24px" }} onClick={handleMenuClick}/>
            </Link> */}
        </div>
      )}
    </div>
  )
}

export default HomeHeader
