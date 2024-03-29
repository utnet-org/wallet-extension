import "../style.css"

import logoImg from "data-base64:~assets/icon.png"
import HomeCopyImage from "data-base64:~assets/icons/address_copy.png"
import BrowserImage from "data-base64:~assets/icons/browser.png"
import GetPowerImage from "data-base64:~assets/icons/get_power.png"
import SupportImage from "data-base64:~assets/icons/home_support.png"
import RefreshImage from "data-base64:~assets/icons/refresh.png"
import SendImage from "data-base64:~assets/icons/send.png"
import React, { useEffect, useState } from "react"
import {
  Link,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate
} from "react-router-dom"

import { Storage } from "@plasmohq/storage"

import TopStorage from "~db/user_storage"
import { createIntlObject } from "~i18n"
import FormatType from "~utils/format_type"
import { CustomAlert } from "~utils/hint"
import rpcFunctions from "~utils/rpc_functions"

function MainPage() {
  const storage = new Storage({
    area: "local"
  })
  const bip39 = require("bip39")
  const { derivePath } = require("near-hd-key")
  const nacl = require("tweetnacl")
  const bs58 = require("bs58")
  const [intl, setIntl] = useState(() => {
    // 初始化时根据浏览器语言创建 intl 对象
    const userLanguage = navigator.language.toLowerCase()
    return createIntlObject(userLanguage)
  })
  const [alertType, setAlertType] = useState("") //提示的类型
  const [showCustomAlert, setShowCustomAlert] = useState(false) //是否显示提示
  const [customAlertMessage, setCustomAlertMessage] = useState("") //提示文字内容
  const navigate = useNavigate()
  const [currentAddress, setCurrentAddress] = useState("")
  const [formatAddress, setFormatAddress] = useState("")
  const [walletBalance, setWalletBalance] = useState(0) // 钱包余额
  // 获取账户信息
  const getAccount = async () => {
    const signer = await rpcFunctions.setSigner(
      await TopStorage.getPrivateKey(),
      await TopStorage.getMyAddress(),
      await TopStorage.getChainId()
    )
    const connection = await rpcFunctions.createConnection(
      await TopStorage.getChainId(),
      await TopStorage.getRpcUrl(),
      signer
    )
    const account = await rpcFunctions.setAccount(
      connection,
      await TopStorage.getMyAddress()
    )
    console.log(account)
    return account
  }
  const [account, setAccount] = useState(getAccount) // 账户信息
  const tokensList = [
    // {
    //   acount: walletBalance,
    //   unit: "UNC"
    // }
  ]
  const [activityList, setActivityList] = useState([])
  const [activityListKeys, setActivityListKeys] = useState([])
  const [defalutIndex, setDefalutIndex] = useState(1) // 默认选中的tab
  const changeDefalutIndex = (index: number) => {
    setDefalutIndex(index)
  }
  // 获取钱包余额
  const getAmount = async () => {
    console.log("account:",await account)
    try {
      const response = await rpcFunctions.getAmount(await account)
      console.log(response)
      const balance = FormatType.FormatAmount(response)
      setWalletBalance(parseFloat(balance))
      TopStorage.setBalance(parseFloat(balance))
    } catch (e) {
      setWalletBalance(0)
    }
  }
  const copyMnemonicPhrase = () => {
    const input = document.createElement("input")
    input.setAttribute("readonly", "readonly")
    input.setAttribute("value", currentAddress)
    document.body.appendChild(input)
    input.select()
    input.setSelectionRange(0, 9999)
    if (document.execCommand("copy")) {
      document.execCommand("copy")
      setAlertType("success")
      setShowCustomAlert(true)
      setCustomAlertMessage(
        intl.formatMessage({
          id: "copy_success"
        })
      )
      setTimeout(() => {
        // 这里是要执行的代码块
        setShowCustomAlert(false)
      }, 2000)
    }
    document.body.removeChild(input)
  }
  const checkCurrentLanguage = async () => {
    const userLanguage = await TopStorage.getCurrentLanguage()
    setIntl(createIntlObject(userLanguage))
    const array = Object.keys(await TopStorage.getActivityList())
    const object = Object.values(await TopStorage.getActivityList())
    setActivityList(object)
    setActivityListKeys(array)
    const myAddress = await TopStorage.getMyAddress()
    setCurrentAddress(myAddress)
    if (myAddress !== undefined) {
      setFormatAddress(FormatType.FormatAddress(myAddress))
    }
    console.log(await TopStorage.getBalance())
    if ((await TopStorage.getBalance()) == undefined) {
      await TopStorage.setBalance(0)
    } else {
      setWalletBalance(parseFloat(await TopStorage.getBalance()))
    }
    const getActivityList = async () => {
      const activityList = await TopStorage.getActivityList()
      if (typeof activityList !== "object" || activityList === null) {
        return {}
      }
      return activityList
    }
    getActivityList().then(async (res) => {
      const myAddress = await TopStorage.getMyAddress()
      if (myAddress === null || myAddress === undefined) {
        return
      }
      if (!res) {
        return
      }
      const keys = Object.keys(res)
      keys.forEach((item) => {
        if (res[item].status != "FINAL") {
          chrome.runtime.sendMessage({
            type: "checkTxStatus",
            detailsHash: item,
            accountId: myAddress
          })
        } else {
          console.log("activityList:", res)
          console.log("item:", item)
          console.log("status:", res[item].status)
        }
      })
    })
    await getAmount()
  }
  useEffect(() => {
    checkCurrentLanguage().catch((error) => {
      console.error("An error occurred:", error)
    })
  }, [])
  useEffect(() => {
    const changeActivityList = async () => {
      const array = Object.keys(await TopStorage.getActivityList())
      const object = Object.values(await TopStorage.getActivityList())
      setActivityList(object)
      setActivityListKeys(array)
    }
    changeActivityList()
  }, [storage])
  document.title = "MainPage"
  return (
    <div
      style={{
        width: "90%",
        minWidth: "327px",
        maxWidth: "800px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative"
      }}>
      {/* 没有遮罩层的提示 */}
      {showCustomAlert && (
        <CustomAlert
          message={customAlertMessage}
          type={alertType}
          onclick={() => {}}
        />
      )}
      <div
        className="flex_center_center"
        style={{
          padding: "5px 15px",
          margin: "20px 0 26px",
          backgroundColor: "#3EDFCF",
          borderRadius: "20px"
        }}>
        <div
          style={{
            color: "#FFFFFF",
            fontSize: "12px",
            fontWeight: 400,
            margin: "0 10px 0 0"
          }}>
          {formatAddress}
        </div>
        <img
          onClick={copyMnemonicPhrase}
          src={HomeCopyImage}
          alt=""
          style={{ width: "9px", height: "9px", cursor: "pointer" }}
        />
      </div>
      <div className="flex_center_center">
        <div
          style={{
            fontSize: "24px",
            fontWeight: 700,
            fontFamily: "Lantinghei SC"
          }}>
          {walletBalance}
        </div>
        <div style={{ fontSize: "18px", marginLeft: "5px", fontWeight: 600 }}>
          U
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gridColumnGap: "50px",
          margin: "29px 0 10px"
        }}>
        <div
          onClick={() => {
            navigate("/tabs/home.html#send")
          }}
          className="flex_center_center_column"
          style={{ cursor: "pointer" }}>
          <img
            src={SendImage}
            alt=""
            style={{ width: "40px", height: "40px", margin: "0 0 6px 0" }}
          />
          <div style={{ fontSize: "12px", fontWeight: 400 }}>
            {intl.formatMessage({
              id: "send"
            })}
          </div>
        </div>
        <div
          className="flex_center_center_column"
          style={{ cursor: "pointer" }}>
          <img
            src={BrowserImage}
            alt=""
            style={{ width: "40px", height: "40px", margin: "0 0 6px 0" }}
          />
          <div style={{ fontSize: "12px", fontWeight: 400 }}>
            {intl.formatMessage({
              id: "browser"
            })}
          </div>
        </div>
        <div
          onClick={() => {
            navigate("/tabs/home.html#getPower")
          }}
          className="flex_center_center_column"
          style={{ cursor: "pointer" }}>
          <img
            src={GetPowerImage}
            alt=""
            style={{ width: "40px", height: "40px", margin: "0 0 6px 0" }}
          />
          <div style={{ fontSize: "12px", fontWeight: 400 }}>
            {intl.formatMessage({
              id: "get_power"
            })}
          </div>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          background:
            "linear-gradient(180deg, rgba(243.79, 248.11, 247.59, 0.05) 0%, rgba(244, 248, 248, 0) 100%)",
          boxShadow: "0px 1px 1px 1px rgba(223.26, 230.95, 230.02, 0.50) inset",
          borderRadius: 10,
          margin: "0 20px 12px",
          padding: "12px",
          boxSizing: "border-box"
        }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridColumnGap: "9px",
            alignItems: "center",
            justifyContent: "space-evenly",
            marginBottom: "20px"
          }}>
          <div
            onClick={() => {
              changeDefalutIndex(0)
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "7px",
              textAlign: "center",
              cursor: "pointer",
              fontSize: "15px",
              color: defalutIndex === 0 ? "white" : "",
              backgroundColor: defalutIndex === 0 ? "#3EDFCF" : ""
            }}>
            {intl.formatMessage({
              id: "tokens"
            })}
          </div>
          <div
            onClick={() => {
              changeDefalutIndex(1)
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "7px",
              textAlign: "center",
              cursor: "pointer",
              fontSize: "15px",
              color: defalutIndex === 1 ? "white" : "",
              backgroundColor: defalutIndex === 1 ? "#3EDFCF" : ""
            }}>
            {intl.formatMessage({
              id: "activity"
            })}
          </div>
        </div>
        {defalutIndex === 0 ? (
          tokensList.length == 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: 400,
                color: "rgba(21, 28, 26, 0.3)",
                marginTop: "34px"
              }}>
              {intl.formatMessage({
                id: "no_have_tokens"
              })}
            </div>
          ) : (
            tokensList.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "0 8px 20px",
                  boxSizing: "border-box"
                }}>
                <img
                  src={logoImg}
                  alt=""
                  style={{ width: "28px", height: "34px", marginRight: "11px" }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start"
                  }}>
                  <div style={{ fontSize: "12px", fontWeight: 700 }}>
                    {item.unit}
                  </div>
                  <div style={{ fontSize: "13px", color: "#151C1AE5" }}>
                    {item.acount} U
                  </div>
                </div>
              </div>
            ))
          )
        ) : activityList.length == 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              fontWeight: 400,
              color: "rgba(21, 28, 26, 0.3)",
              marginTop: "34px"
            }}>
            {intl.formatMessage({
              id: "no_have_transactions"
            })}
          </div>
        ) : (
          <div
            style={{
              height: "170px",
              overflowY: "scroll"
            }}>
            {activityList.reverse().map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  margin: "0 8px 20px",
                  boxSizing: "border-box"
                }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={logoImg}
                    alt=""
                    style={{
                      width: "28px",
                      height: "34px",
                      marginRight: "11px"
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start"
                    }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "rgba(21, 28, 26, 0.6)"
                      }}>
                      {FormatType.FormatAddress(item.toAddress)}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "rgba(21, 28, 26, 0.9)"
                      }}>
                      {item.amount} U
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    color: item.status == "FINAL" ? "#3EDFCF" : "#f79e13"
                  }}>
                  {item.status == "FINAL" ? "SUCCESS" : "WAITING"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          marginBottom: "8px",
          marginLeft: "2px"
        }}>
        <img
          src={RefreshImage}
          alt=""
          style={{
            width: "20px",
            height: "20px",
            marginRight: "6px",
            cursor: "pointer"
          }}
        />
        <div
          style={{
            fontSize: "13px",
            fontWeight: 400,
            color: "#3EDFCF",
            cursor: "pointer"
          }}>
          {intl.formatMessage({
            id: "refresh_list"
          })}
        </div>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          marginBottom: "8px",
          marginLeft: "2px"
        }}>
        <img
          src={SupportImage}
          alt=""
          style={{
            width: "20px",
            height: "20px",
            marginRight: "6px",
            cursor: "pointer"
          }}
        />
        <div
          style={{
            fontSize: "13px",
            fontWeight: 400,
            color: "#3EDFCF",
            cursor: "pointer"
          }}>
          {intl.formatMessage({
            id: "utility_support"
          })}
        </div>
      </div>
    </div>
  )
}

export default MainPage
