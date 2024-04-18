import bs58 from "bs58"
import BrowserMiniImage from "data-base64:~assets/icons/browser_mini.png"
import CheckCircleBrokenImage from "data-base64:~assets/icons/check-circle-broken.png"
import CopyImage from "data-base64:~assets/icons/copy.png"
import GetBackImage from "data-base64:~assets/icons/get_back.png"
import CloseImage from "data-base64:~assets/icons/x_close.png"
import TransferIconImage from "data-base64:~assets/images/transfer_icon.png"
import TransferImage from "data-base64:~assets/images/transfer_icon.png"
import React, {useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"

import {Storage} from "@plasmohq/storage"

import TopStorage from "~db/user_storage"
import FormatType from "~utils/format_type"
import IdenticonAvatar from "~utils/identiconAvatar"
import rpcFunctions from "~utils/rpc_functions"

function ConfirmTransaction() {
    const storage = new Storage({
        area: "local"
    })
    const navigate = useNavigate()
    const [confirmMask, setConfirmMask] = React.useState(false)
    const [sendAddress, setSendAddress] = React.useState(
        "0x010101011010101001010101101010100101010110101010"
    )
    const [sendGasPrice, setSendGasPrice] = React.useState(0)
    const [myBalance, setMyBalance] = React.useState(0)
    const [sendAmount, setSendAmount] = React.useState(0)
    const [txNonce, setTxNonce] = React.useState(0)
    const [txHash, setTxHash] = React.useState("")
    const [currentAddress, setCurrentAddress] = useState(
        "0x010101011010101001010101101010100101010110101010"
    )

    const confirmMouseOver = (e: any) => {
        e.target.style.background = "#3EDFCF"
    }
    const confirmMouseOut = (e: any) => {
        e.target.style.background = "transparent"
    }
    const denyMouseOver = (e: any) => {
        e.target.style.background = "#3EDFCF"
    }
    const denyMouseOut = (e: any) => {
        e.target.style.background = "transparent"
    }
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
    const toConfirm = async () => {
        const res = await chrome.runtime.sendMessage({
            type: "sendMoney",
            sendAddress: sendAddress,
            sendAmount: sendAmount,
            accountId: await TopStorage.getMyAddress()
        })
        await setTxNonce(res.nonce)
        await setTxHash(res.txHash)
        setConfirmMask(true)
    }
    useEffect(() => {
        const getDefalutData = async () => {
            setSendAddress(await storage.get("sendAddress"))
            setSendGasPrice(await storage.get("sendGasPrice"))
            setMyBalance(await storage.get("myBalance"))
            setSendAmount(await storage.get("sendAmount"))
            const myAddress = await TopStorage.getMyAddress()
            if (myAddress !== undefined) {
                setCurrentAddress(myAddress)
            }
            console.log("currentAddress:", currentAddress)
            console.log("sendAddress:", sendAddress)
        }
        getDefalutData()
    }, [])
    return (
        <div
            // className="welcome_page"
            style={{
                width: "327px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: "10px"
            }}>
            {confirmMask && (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        top: "0",
                        left: "0",
                        zIndex: 99,
                        backgroundColor: "rgba(21, 28, 26, 0.2)",
                        display: "flex",
                        justifyContent: "center"
                    }}>
                    <div
                        style={{
                            width: "275px",
                            height: "max-content",
                            padding: "24px",
                            boxSizing: "border-box",
                            marginTop: "72px",
                            background: "#FFFEFB",
                            boxShadow: "0px 4px 24px rgba(228, 233, 232, 0.50)",
                            borderRadius: 12
                        }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}>
                            <div
                                style={{
                                    color: "rgba(21.29, 27.63, 26.10, 0.90)",
                                    fontSize: 16,
                                    fontFamily: "Lantinghei SC",
                                    fontWeight: "400",
                                    wordWrap: "break-word"
                                }}>
                                Send
                            </div>
                            <img
                                onClick={() => {
                                    navigate(-2)
                                }}
                                src={CloseImage}
                                alt=""
                                style={{width: "20px", height: "20px"}}
                            />
                        </div>
                        <div
                            style={{
                                margin: "18px 0 14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}>
                            <div style={{fontSize: "12px", fontWeight: 700}}>Status</div>
                            <div style={{display: "flex", alignItems: "center"}}>
                                <img
                                    src={CheckCircleBrokenImage}
                                    alt=""
                                    style={{width: "13px", height: "13px", marginRight: "4px"}}
                                />
                                <div style={{color: "#1CDA8A", fontSize: "12px"}}>
                                    Verified
                                </div>
                            </div>
                        </div>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <img
                                src={BrowserMiniImage}
                                alt=""
                                style={{width: "15px", height: "15px", marginRight: "4px"}}
                            />
                            <div
                                style={{
                                    color: "#3EDFCF",
                                    fontSize: "12px",
                                    textDecoration: "underline"
                                }}>
                                View on blockchain browser
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                margin: "10px 0 20px"
                            }}>
                            <img
                                src={CopyImage}
                                alt=""
                                style={{width: "15px", height: "15px", marginRight: "4px"}}
                            />
                            <div
                                style={{
                                    color: "#3EDFCF",
                                    fontSize: "12px",
                                    textDecoration: "underline"
                                }}>
                                Copy transaction ID
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                            <div className="flex_center_center_column">
                                <div
                                    style={{
                                        color: "rgba(21, 28, 26, 0.9)",
                                        fontSize: "12px",
                                        fontWeight: 700
                                    }}>
                                    From
                                </div>
                                <div style={{margin: "6px 0 4px"}}>
                                    <IdenticonAvatar
                                        address={currentAddress}
                                        size={32}></IdenticonAvatar>
                                </div>
                                <div
                                    style={{color: "rgba(21, 28, 26, 0.6)", fontSize: "12px"}}>
                                    Account1
                                </div>
                            </div>
                            <img
                                src={TransferIconImage}
                                alt=""
                                style={{width: "39px", height: "9px"}}
                            />
                            <div className="flex_center_center_column">
                                <div
                                    style={{
                                        color: "rgba(21, 28, 26, 0.9)",
                                        fontSize: "12px",
                                        fontWeight: 700
                                    }}>
                                    To
                                </div>
                                <div style={{margin: "6px 0 4px"}}>
                                    <IdenticonAvatar
                                        address={sendAddress}
                                        size={32}></IdenticonAvatar>
                                </div>
                                <div
                                    style={{color: "rgba(21, 28, 26, 0.6)", fontSize: "12px"}}>
                                    {FormatType.FormatAddress(sendAddress)}
                                </div>
                            </div>
                        </div>
                        <div
                            style={{
                                margin: "17px 0 10px",
                                fontSize: "14px",
                                fontWeight: 700
                            }}>
                            Transaction
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "10px"
                            }}>
                            <div style={{color: "rgba(21, 28, 26, 0.6)", fontSize: "12px"}}>
                                Nonce
                            </div>
                            <div style={{fontSize: "14px"}}>{txNonce}</div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "10px"
                            }}>
                            <div style={{color: "rgba(21, 28, 26, 0.6)", fontSize: "12px"}}>
                                Amount
                            </div>
                            <div style={{fontSize: "14px", fontWeight: 600}}>
                                {sendAmount} u
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "10px"
                            }}>
                            <div style={{color: "rgba(21, 28, 26, 0.6)", fontSize: "12px"}}>
                                Total Gas fee
                            </div>
                            <div style={{fontSize: "14px"}}>{sendGasPrice} u</div>
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height: "1px",
                                backgroundColor: "rgba(21, 28, 26, 0.15)",
                                marginBottom: "10px"
                            }}></div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}>
                            <div
                                style={{
                                    color: "rgba(21, 28, 26, 0.6)",
                                    fontSize: "12px",
                                    fontWeight: 600
                                }}>
                                Total
                            </div>
                            <div style={{fontWeight: 600, fontSize: "12px"}}>
                                {sendAmount} u
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div
                style={{
                    width: "100%",
                    padding: "13px 20px",
                    // boxSizing: "border-box",
                    background: "#FFFEFB",
                    boxShadow: "0px 4px 24px rgba(228, 233, 232, 0.50)",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    display: "flex"
                }}>
                <img
                    onClick={() => {
                        navigate(-1)
                    }}
                    src={GetBackImage}
                    alt=""
                    style={{width: "24px", height: "24px"}}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "30px"
                }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                    <IdenticonAvatar address={currentAddress} size={40}></IdenticonAvatar>
                    <div>Account 1</div>
                </div>
                <img
                    src={TransferImage}
                    alt=""
                    style={{width: "39px", height: "9px", margin: "0px 10px"}}
                />
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                    <IdenticonAvatar address={sendAddress} size={40}></IdenticonAvatar>
                    <div>{FormatType.FormatAddress(sendAddress)}</div>
                </div>
            </div>
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "28px"
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
                        Balance: {myBalance} U
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
                    <div
                        style={{
                            color: "rgba(21.29, 27.63, 26.10, 0.90)",
                            fontSize: 14,
                            fontFamily: "Inter",
                            fontWeight: "500",
                            wordWrap: "break-word"
                        }}>
                        {sendAmount} U
                    </div>
                    {/* <div
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
          </div> */}
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
                        padding: "13px",
                        fontSize: "14px",
                        color: "rgba(21.29, 27.63, 26.10, 0.60)",
                        background: "#F6F9F9",
                        borderRadius: 6
                    }}>
                    {sendGasPrice} U
                </div>
            </div>
            <div style={{height: "120px"}}></div>
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
                    onMouseOver={denyMouseOver}
                    onMouseOut={denyMouseOut}
                    style={{
                        padding: "10px 22px",
                        border: "1px #3EDFCF solid",
                        borderRadius: 6,
                        marginRight: "36px",
                        cursor: "pointer"
                    }}>
                    Deny
                </div>
                <div
                    onClick={toConfirm}
                    onMouseOver={confirmMouseOver}
                    onMouseOut={confirmMouseOut}
                    style={{
                        padding: "10px 22px",
                        border: "1px #3EDFCF solid",
                        borderRadius: 6,
                        cursor: "pointer"
                    }}>
                    Confirm
                </div>
            </div>
        </div>
    )
}

export default ConfirmTransaction
