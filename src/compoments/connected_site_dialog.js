import xClose from "data-base64:~assets/icons/x_close.png"
import ConnectingSuccessImg from "data-base64:~assets/images/connecting_success.png"
import React, { useEffect, useState } from "react"

import TopStorage from "~db/user_storage"
import { createIntlObject } from "~i18n"
import IdenticonAvatar from "~utils/identiconAvatar"

const ConnectedSitesDialog = ({ _onClose }) => {
  const [intl, setIntl] = useState(() => {
    // 初始化时根据浏览器语言创建 intl 对象
    const userLanguage = navigator.language.toLowerCase()

    return createIntlObject(userLanguage)
  })

  const checkCurrentLanguage = async () => {
    const currentLanguage = await TopStorage.getCurrentLanguage()
    if (currentLanguage !== undefined) {
      // 更新 intl 对象
      setIntl(createIntlObject(currentLanguage))
    }
  }

  useEffect(() => {
    // 在组件挂载后检查当前语言
    checkCurrentLanguage().catch((error) => {
      console.error("An error occurred:", error)
    })
  }, [])

  const [currentAddress, setCurrentAddress] = useState(
    "0x010101011010101001010101101010100101010110101010"
  )
  const truncatedValue =
    currentAddress.length > 13
      ? `${currentAddress.substring(0, 7)}...${currentAddress.slice(-5)}`
      : currentAddress
  const [currentPage, setCurrentPage] = useState(1)
  const [topLevelDomain, setTopLevelDomain] = useState("")
  const [tabFavIconUrl, setTabFavIconUrl] = useState("")
  const [connectedSites, setConnectedSites] = useState({})
  const [selectedSite, setSelectedSite] = useState("")
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // 获取我的地址
      const myAddress = await TopStorage.getMyAddress()
      if (myAddress !== undefined) {
        setCurrentAddress(myAddress)
      }

      const _connectedSites = await TopStorage.getConnectedSites()
      if (_connectedSites !== undefined) {
        setConnectedSites(_connectedSites)
      } else {
        setConnectedSites({})
      }

      // 查询当前活动选项卡的URL
      chrome.tabs.query(
        { active: true, currentWindow: true },
        async function (tabs) {
          const currentUrl = tabs[0].url
          const url = new URL(currentUrl)
          const topLevelDomain = url.origin
          setTopLevelDomain(topLevelDomain)
          setTabFavIconUrl(tabs[0].favIconUrl)
          const _isConnected =
            await TopStorage.searchConnectedSite(topLevelDomain)
          if (_isConnected !== undefined) {
            setIsConnected(_isConnected)
          } else {
            setIsConnected(false)
          }
        }
      )
    }
    fetchData()
  }, [])

  useEffect(() => {
    console.log("connectedSites:", connectedSites)
  }, [connectedSites])

  // const handleBack = () => {
  //     // 后退操作，跳转到上一页
  //     setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  // };

  const handleForward = () => {
    // 前进操作，跳转到下一页
    setCurrentPage((prevPage) => Math.max(prevPage + 1, 1))
  }

  const handleForwardTo = (page) => {
    setCurrentPage(page)
  }

  const handleClose = () => {
    _onClose()
  }

  const handleConnect = async () => {
    await TopStorage.addConnectedSite(topLevelDomain, tabFavIconUrl)
    handleForwardTo(4)
    setTimeout(() => {
      handleClose()
    }, 1000)
  }

  const handleDisconnect = async () => {
    await TopStorage.deleteConnectedSite(selectedSite)
    handleClose()
  }

  const selectDisconnectSite = async (site) => {
    setSelectedSite(site)
    handleForward()
  }

  const handleDialogClick = (event) => {
    // 阻止事件冒泡，防止链接的点击事件触发
    event.preventDefault()
    event.stopPropagation()
  }

  const Page1 = () => (
    <div className="flex_center_center_column">
      {Object.keys(connectedSites).length === 0 ? (
        <div
          className="text_black_14_400"
          style={{ marginTop: "15px", width: "100%", textAlign: "start" }}>
          {intl.formatMessage(
            { id: "account_not_connected_to_any" },
            { account: "Account1" }
          )}
        </div>
      ) : (
        <div style={{ marginTop: "10px", width: "100%" }}>
          {Object.entries(connectedSites).map(([site, faviconUrl]) => (
            <div
              className="flex_center_between"
              key={site}
              style={{ marginTop: "15px" }}>
              <div className="flex_center_center">
                <img
                  src={faviconUrl}
                  alt="Favicon"
                  style={{ width: "24px", height: "24px", marginRight: "8px" }}
                />{" "}
                {/* 显示小图标 */}
                {site} {/* 显示网站URL */}
              </div>
              <div
                className="text_primary_12_400"
                style={{ cursor: "pointer" }}
                onClick={() => selectDisconnectSite(site)}>
                {intl.formatMessage({ id: "disconnect" })}
              </div>
            </div>
          ))}
        </div>
      )}
      {isConnected ? null : (
        <div
          className="border-6-primary flex_center_center text_black_14_400"
          style={{
            padding: "12px 24px",
            marginTop: "15px",
            marginBottom: "5px",
            cursor: "pointer"
          }}
          onClick={() => handleForwardTo(3)}>
          {intl.formatMessage({ id: "manually_connect_to_current_site" })}
        </div>
      )}
    </div>
  )
  const Page2 = () => (
    <div className="flex_center_center_column">
      <div
        className="flex_center_center text_black_14_400"
        style={{ marginTop: "15px" }}>
        {intl.formatMessage({ id: "disconnect_warning" })}
      </div>
      <div
        className={"flex_center_between"}
        style={{ marginTop: "10px", width: "100%", maxWidth: "245" }}>
        <div
          className="border-6-primary flex_center_center text_black_14_400"
          style={{
            padding: "12px 24px",
            marginTop: "15px",
            marginBottom: "5px",
            cursor: "pointer"
          }}
          onClick={handleClose}>
          {intl.formatMessage({ id: "cancel" })}
        </div>
        <div
          className="border-6-primary flex_center_center text_black_14_400"
          style={{
            padding: "12px 24px",
            marginTop: "15px",
            marginBottom: "5px",
            cursor: "pointer"
          }}
          onClick={handleDisconnect}>
          {intl.formatMessage({ id: "disconnect" })}
        </div>
      </div>
    </div>
  )
  const Page3 = () => (
    <div className="flex_center_center_column">
      <div
        className="flex_center_center text_black_16_600"
        style={{ marginTop: "15px" }}>
        {intl.formatMessage(
          { id: "connect_to_account" },
          { account: "Account1" }
        )}
      </div>
      <div className="flex_center_center text_black_16_600">
        ({truncatedValue})
      </div>
      <div
        className="flex_center_center text_black_14_400"
        style={{ marginTop: "10px" }}>
        {intl.formatMessage({ id: "allow_this_site_to" })}
      </div>
      <div
        className="flex_center_center text_black_14_400"
        style={{ marginTop: "15px" }}>
        {intl.formatMessage({ id: "allow_word" })}
      </div>
      <div className="divider90" style={{ marginTop: "15px" }}></div>
      <div
        className="flex_center_center text_151c1a66_12_400"
        style={{ marginTop: "150px" }}>
        {intl.formatMessage({ id: "only_connect_to_websites_you_trust" })}
      </div>
      <div className="divider110" style={{ marginTop: "10px" }}></div>
      <div
        className={"flex_center_between"}
        style={{ marginTop: "10px", width: "90%", maxWidth: "245" }}>
        <div
          className="border-6-primary flex_center_center text_black_14_400"
          style={{
            padding: "12px 24px",
            marginTop: "15px",
            marginBottom: "5px",
            cursor: "pointer"
          }}
          onClick={handleClose}>
          {intl.formatMessage({ id: "cancel" })}
        </div>
        <div
          className="border-6-primary flex_center_center text_black_14_400"
          style={{
            padding: "12px 24px",
            marginTop: "15px",
            marginBottom: "5px",
            cursor: "pointer"
          }}
          onClick={handleConnect}>
          {intl.formatMessage({ id: "connect" })}
        </div>
      </div>
    </div>
  )
  const Page4 = () => (
    <div className="flex_center_center_column">
      <div className="text_black_16_600">
        {intl.formatMessage({ id: "connecting" })}
      </div>
      <div
        className="flex_center_between text_primary_36_400"
        style={{ marginTop: "15px", marginBottom: "15px", width: "80%" }}>
        <IdenticonAvatar address={currentAddress} size={40}></IdenticonAvatar>
        · ·
        <img
          src={ConnectingSuccessImg}
          style={{ width: "25px", height: "25px" }}
          alt={"ConnectingSuccessImg"}
        />
        · ·
        <img
          src={tabFavIconUrl}
          style={{ width: "40px", height: "40px" }}
          alt={"tabFavIconUrl"}
        />
      </div>
    </div>
  )

  return (
    <div className="dialog" onClick={(event) => handleDialogClick(event)}>
      <div className="flex_center_between">
        {currentPage === 1 ? (
          <div className="text_black_16_600">
            {intl.formatMessage({ id: "connected_sites" })}
          </div>
        ) : null}
        {currentPage === 2 ? (
          <div className="text_black_16_600">
            {intl.formatMessage(
              { id: "disconnect_site" },
              { site: selectedSite }
            )}
          </div>
        ) : null}
        {currentPage === 3 ? (
          <div style={{ width: "20px", height: "20px" }} />
        ) : null}
        {currentPage === 3 ? (
          <div className="flex_center_center address-container text_white_12_400">
            <div
              style={{
                width: "100%",
                maxWidth: "235px",
                overflowWrap: "break-word"
              }}>
              {topLevelDomain}
            </div>
          </div>
        ) : null}
        {currentPage !== 4 ? (
          <img
            src={xClose}
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
            onClick={handleClose}
            alt={"Close"}
          />
        ) : null}
      </div>
      <div className="dialog-body">
        {/* 根据当前页面渲染不同的内容 */}
        {currentPage === 1 && <Page1 />}
        {currentPage === 2 && <Page2 />}
        {currentPage === 3 && <Page3 />}
        {currentPage === 4 && <Page4 />}
      </div>
    </div>
  )
}

export default ConnectedSitesDialog
