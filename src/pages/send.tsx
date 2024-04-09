import bs58 from "bs58"
import ScanImage from "data-base64:~assets/icons/scan.png"
import XCloseImage from "data-base64:~assets/icons/x-close.png"
import DevAvatar from "data-base64:~assets/images/dev_avatar.png"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Storage } from "@plasmohq/storage"

import TopStorage from "~db/user_storage"
import { createIntlObject } from "~i18n"
import FormatType from "~utils/format_type"
import { CustomAlert } from "~utils/hint"
import rpcFunctions from "~utils/rpc_functions"

function SendPage() {
  const storage = new Storage({
    area: "local"
  })
  const [intl, setIntl] = useState(() => {
    // 初始化时根据浏览器语言创建 intl 对象
    const userLanguage = navigator.language.toLowerCase()
    return createIntlObject(userLanguage)
  })
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [amount, setAmount] = useState("0")
  const [inputAddress, setInputAddress] = useState("")
  const [walletBalance, setWalletBalance] = useState(0) // 钱包余额
  const [maxSendAmount, setMaxSendAmount] = useState("0") // 最大发送金额
  const [gasPrice, setGasPrice] = useState("0") // gas价格
  const [alertType, setAlertType] = useState("") //提示的类型
  const [showCustomAlert, setShowCustomAlert] = useState(false) //是否显示提示
  const [customAlertMessage, setCustomAlertMessage] = useState("") //提示文字内容
  const [activityList, setActivityList] = useState([
    {
      name: "Account 1",
      acount: 0,
      unit: "UNC",
      address: "0x00000000000000...0000",
      type: "Send"
    },
    {
      name: "Account 2",
      acount: 999999,
      unit: "UNC",
      address: "0x00000000000000...0000",
      type: "Receive"
    },
    {
      name: "Account 3",
      acount: 999999,
      unit: "UNC",
      address: "0x00111111111111...1111",
      type: "Receive"
    }
  ])
  const getBack = () => {
    if (step == 0) {
      navigate(-1)
    } else {
      setStep(step - 1)
      setInputAddress("")
    }
  }
  const checkAmount = (item: any) => {
    setStep(1)
    console.log(item)
    console.log(item["address"])
  }
  const cancelBtnMouseOver = (e: any) => {
    e.target.style.background = "#3EDFCF"
  }
  const cancelBtnMouseOut = (e: any) => {
    e.target.style.background = "transparent"
  }
  const nextBtnMouseOver = (e: any) => {
    e.target.style.background = "#3EDFCF"
  }
  const nextBtnMouseOut = (e: any) => {
    e.target.style.background = "transparent"
  }
  const toNext = () => {
    if (Number(amount) <= 0 || amount === "") {
      return
    }
    if (Number(amount) > Number(maxSendAmount)) {
      setAlertType("error")
      setShowCustomAlert(true)
      setCustomAlertMessage(
        intl.formatMessage({
          id: "insufficient_balance"
        })
      )
      setTimeout(() => {
        // 这里是要执行的代码块
        setShowCustomAlert(false)
      }, 2000)
      return
    }
    storage.set("sendAmount", amount)
    storage.set("sendAddress", inputAddress)
    storage.set("sendGasPrice", gasPrice)
    storage.set("myBalance", walletBalance)
    navigate("/tabs/home.html#confirm")
  }
  const [isValidAddress, setIsValidAddress] = useState<boolean>()
  //校验输入的地址是否合法
  const isValidAccountId = async (accountId) => {
    if (accountId.length !== 64) {
      setIsValidAddress(false)
      return false
    }
    for (let i = 0; i < accountId.length; i++) {
      const charCode = accountId.charCodeAt(i)
      if (
        !(
          (charCode >= 97 && charCode <= 102) ||
          (charCode >= 48 && charCode <= 57)
        )
      ) {
        setIsValidAddress(false)
        return false
      }
    }
    setIsValidAddress(true)
    setStep(1)
    return true
  }
  const getConnection = async () => {
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
    return connection
  }
  // 获取账户信息
  const getAccount = async () => {
    const account = await rpcFunctions.setAccount(
      await getConnection(),
      await TopStorage.getMyAddress()
    )
    console.log(account)
    return account
  }
  const [account, setAccount] = useState(getAccount) // 账户信息
  // 获取钱包余额
  const getAmount = async () => {
    try {
      const storageBalance = await TopStorage.getBalance()
      setWalletBalance(parseFloat(storageBalance))
      const response = await rpcFunctions.getAmount(await account)
      const gasPrice = await rpcFunctions.getGasPrice(await getConnection())
      setGasPrice(FormatType.FormatGasPrice(gasPrice))
      const maxBalance = Number(response) - Number(gasPrice)
      setMaxSendAmount(FormatType.FormatAmount(maxBalance.toString()))
      const balance = FormatType.FormatAmount(response)
      setWalletBalance(parseFloat(balance))
    } catch (e) {
      setWalletBalance(0)
    }
  }
  // useEffect(() => {
  //   const checkCurrentAddress = async () => {
  //     if (inputAddress.length != 0) {
  //       console.log(isValidAccountId(inputAddress))
  //     }
  //   }

  //   checkCurrentAddress()
  // }, [inputAddress])
  const checkCurrentLanguage = async () => {
    const userLanguage = await TopStorage.getCurrentLanguage()
    setIntl(createIntlObject(userLanguage))
  }
  useEffect(() => {
    checkCurrentLanguage().catch((error) => {
      console.error("An error occurred:", error)
    })
  }, [storage])
  useEffect(() => {
    // const myAddress = await TopStorage.getMyAddress()
    // setCurrentAddress(myAddress)
    // if (myAddress !== undefined) {
    //   setFormatAddress(FormatAddress(myAddress))
    // }
    getAmount()
  }, [])
  document.title = "Send"
  return (
    <div>
      {/* 没有遮罩层的提示 */}
      {showCustomAlert && (
        <CustomAlert
          message={customAlertMessage}
          type={alertType}
          onclick={() => {}}
        />
      )}
      <div
        className="flex_center_center_column"
        style={{
          width: "100",
          height: "100%",
          marginTop: "10px",
          backgroundColor: "#ffffff",
          position: "relative"
        }}>
        <div
          style={{
            width: "327px",
            height: "100%"
          }}>
          <div
            style={{
              marginTop: "12px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative"
            }}>
            <div
              style={{
                color: "rgba(21.29, 27.63, 26.10, 0.90)",
                fontSize: 18,
                fontFamily: "Lantinghei SC",
                fontWeight: "400",
                wordWrap: "break-word"
              }}>
              Send to
            </div>
            <div
              onClick={getBack}
              style={{
                position: "absolute",
                right: "0",
                color: "rgba(62, 223, 207, 1)",
                cursor: "pointer"
              }}>
              Cancel
            </div>
          </div>
          {step == 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 13px",
                  marginBottom: "24px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(246, 249, 249, 1)"
                }}>
                <input
                  className="custom_input"
                  type="text"
                  placeholder="Enter public address(0x)"
                  value={inputAddress}
                  style={{
                    border: "none",
                    flex: 1,
                    marginRight: "13px",
                    backgroundColor: "transparent"
                  }}
                  onChange={(e) => {
                    console.log(e.target.value)
                    setInputAddress(e.target.value)
                    isValidAccountId(e.target.value)
                  }}
                />
                <img
                  src={ScanImage}
                  alt=""
                  style={{ width: "24px", height: "24px" }}
                />
              </div>
              {isValidAddress === false && inputAddress.length > 0 && (
                <div
                  style={{
                    color: "rgba(255, 0, 0, 1)",
                    fontSize: 12,
                    fontFamily: "Lantinghei SC",
                    fontWeight: "400",
                    wordWrap: "break-word",
                    margin: "-12px 0 12px 0"
                  }}>
                  Invalid address
                </div>
              )}
              {/* <div
                style={{
                  width: "100%",
                  padding: "20px",
                  boxSizing: "border-box",
                  minHeight: "350px",
                  background:
                    "linear-gradient(180deg, rgba(243.79, 248.11, 247.59, 0.05) 0%, rgba(244, 248, 248, 0) 100%)",
                  boxShadow:
                    "0px 1px 1px 1px rgba(223.26, 230.95, 230.02, 0.50) inset",
                  borderRadius: 10,
                  backdropFilter: "blur(8px)"
                }}>
                <div
                  style={{
                    color: "rgba(21.29, 27.63, 26.10, 0.90)",
                    fontSize: 18,
                    fontFamily: "Inter",
                    fontWeight: "600",
                    wordWrap: "break-word"
                  }}>
                  Your Accounts
                </div>
                {activityList.map((item, index) => (
                  <div
                    onClick={() => {
                      checkAmount(item)
                    }}
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      margin: "20px 0px 0px 0",
                      boxSizing: "border-box",
                      cursor: "pointer"
                    }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={DevAvatar}
                        alt=""
                        style={{
                          width: "28px",
                          height: "28px",
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
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "rgba(21, 28, 26, 0.9)"
                          }}>
                          {item.name}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "rgba(21, 28, 26, 0.6)"
                          }}>
                          {item.address}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>
          )}
          {step == 1 && (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column"
              }}>
              <div
                style={{
                  width: "100%",
                  padding: "13px",
                  boxSizing: "border-box",
                  backgroundColor: "rgba(246, 249, 249, 1)",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start"
                  }}>
                  {/* <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "rgba(21, 28, 26, 0.9)",
                      marginBottom: "2px"
                    }}>
                    Account 1
                  </div> */}
                  <div
                    style={{
                      maxWidth: "270px",
                      wordWrap: "break-word",
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "rgba(21, 28, 26, 0.6)"
                    }}>
                    {inputAddress}
                  </div>
                </div>
                <img
                  onClick={getBack}
                  src={XCloseImage}
                  alt=""
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "14px"
                }}>
                <div
                  style={{
                    color: "rgba(21.29, 27.63, 26.10, 0.90)",
                    fontSize: 14,
                    fontFamily: "Lantinghei SC",
                    fontWeight: "400",
                    wordWrap: "break-word",
                    marginRight: "14px"
                  }}>
                  Assets
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "8px 13px",
                    backgroundColor: "rgba(246, 249, 249, 1)",
                    borderRadius: "6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                    justifyContent: "start"
                  }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "rgba(21, 28, 26, 0.9)",
                      marginBottom: "4px"
                    }}>
                    U
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "rgba(21, 28, 26, 0.6)"
                    }}>
                    Balance: {walletBalance} U
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "14px"
                }}>
                <div
                  style={{
                    color: "rgba(21.29, 27.63, 26.10, 0.90)",
                    fontSize: 14,
                    fontFamily: "Lantinghei SC",
                    fontWeight: "400",
                    wordWrap: "break-word",
                    marginRight: "14px"
                  }}>
                  Amount
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "#F6F9F9",
                    borderRadius: 6,
                    padding: "8px 8px 8px 13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                  <div>
                    <input
                      className="custom_input"
                      type="text"
                      placeholder=""
                      style={{
                        fontSize: "14px",
                        border: "none",
                        backgroundColor: "transparent",
                        width: amount.length + "ch",
                        maxWidth: "160px",
                        marginRight: "10px"
                      }}
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value)
                        console.log(amount)
                      }}
                    />
                    <span
                      style={{
                        color: "rgba(21.29, 27.63, 26.10, 0.90)",
                        fontSize: 12,
                        fontFamily: "Inter",
                        fontWeight: "500",
                        wordWrap: "break-word"
                      }}>
                      U
                    </span>
                  </div>
                  <div
                    onClick={() => {
                      setAmount(maxSendAmount)
                    }}
                    style={{
                      padding: "6px",
                      background: "#3EDFCF",
                      borderRadius: 5
                    }}>
                    <div
                      style={{
                        color: "white",
                        fontSize: 10,
                        fontFamily: "Lantinghei SC",
                        fontWeight: "400",
                        wordWrap: "break-word"
                      }}>
                      largest
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "14px"
                }}>
                <div
                  style={{
                    marginRight: "13px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                    justifyContent: "center"
                  }}>
                  <div
                    style={{
                      color: "rgba(21.29, 27.63, 26.10, 0.90)",
                      fontSize: 14,
                      fontFamily: "Lantinghei SC",
                      fontWeight: "400",
                      wordWrap: "break-word"
                    }}>
                    Gas
                  </div>
                  <div
                    style={{
                      color: "rgba(21.29, 27.63, 26.10, 0.60)",
                      fontSize: 11,
                      fontFamily: "Lantinghei SC",
                      fontWeight: "400",
                      wordWrap: "break-word"
                    }}>
                    Estimated
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    wordWrap: "break-word",
                    padding: "13px",
                    fontSize: "14px",
                    color: "rgba(21.29, 27.63, 26.10, 0.60)",
                    background: "#F6F9F9",
                    borderRadius: 6
                  }}>
                  {gasPrice} U
                </div>
              </div>
              <div style={{ height: "120px" }}></div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                <div
                  onClick={() => {
                    navigate(-1)
                  }}
                  onMouseOver={cancelBtnMouseOver}
                  onMouseOut={cancelBtnMouseOut}
                  style={{
                    padding: "10px 22px",
                    border: "1px #3EDFCF solid",
                    borderRadius: 6,
                    marginRight: "36px",
                    cursor: "pointer"
                  }}>
                  Cancel
                </div>
                <div
                  onClick={toNext}
                  onMouseOver={nextBtnMouseOver}
                  onMouseOut={nextBtnMouseOut}
                  style={{
                    padding: "10px 22px",
                    border: "1px #3EDFCF solid",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}>
                  Next Step
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default SendPage
