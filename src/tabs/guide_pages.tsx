import createWalletPoint from "data-base64:~assets/icons/create_wallet_point.png"
import GuideImage1 from "data-base64:~assets/images/guide1.png"
import GuideImage2 from "data-base64:~assets/images/guide2.png"
import GuideImage3 from "data-base64:~assets/images/guide3.png"
import React, {useEffect, useState} from "react"

import {Storage} from "@plasmohq/storage"

import {createIntlObject} from "~i18n"
// import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/swiper-bundle.css"

import WelcomeHeader from "~compoments/welcome_header"
import TopStorage from "~db/user_storage"

function GuidePages() {
    const storage = new Storage({
        area: "local"
    })
    const [intl, setIntl] = useState(() => {
        // 初始化时根据浏览器语言创建 intl 对象
        const userLanguage = navigator.language.toLowerCase()
        return createIntlObject(userLanguage)
    })
    const bip39 = require("bip39")
    const bs58 = require("bs58")
    const nacl = require("tweetnacl")
    const {derivePath} = require("near-hd-key")
    const [stepIndex, setStepIndex] = React.useState(0) //当前步骤
    const mouseOver = (e) => {
        e.target.style.background = "#3EDFCF"
    }
    const mouseOut = (e) => {
        e.target.style.background = "white"
    }
    const toNext = () => {
        if (stepIndex === 1) {
            // createFullAccessKey(ACCOUNT_ID)
            // creactNewWallet()
            // chrome.tabs.update({ url: "tabs/guide_pages2.html" })
            chrome.tabs.update({url: "tabs/home.html"})
            return
        }
        setStepIndex(1)
    }
    // 生成助记词
    const mnemonic = bip39.generateMnemonic()
    // 通过助记词获取种子
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const KEY_DERIVATION_PATH = "m/44'/397'/0'"
    const {key} = derivePath(KEY_DERIVATION_PATH, seed.toString("hex"))
    const keyPair = nacl.sign.keyPair.fromSeed(key)
    const publicKey = "ed25519:" + bs58.encode(Buffer.from(keyPair.publicKey))
    const secretKey = "ed25519:" + bs58.encode(Buffer.from(keyPair.secretKey))
    const creactNewWallet = async () => {
        console.log("助记词:", mnemonic)
        // console.log("根私钥:", rootPrivateKey)
        console.log("派生私钥:", secretKey)
        console.log("派生公钥:", publicKey)
        console.log(seed)
        console.log(keyPair)
    }
    const checkCurrentLanguage = async () => {
        const userLanguage = await TopStorage.getCurrentLanguage()
        setIntl(createIntlObject(userLanguage))
    }
    useEffect(() => {
        checkCurrentLanguage().catch((error) => {
            console.error("An error occurred:", error)
        })
    }, [storage])

    document.title = "Complete2" //浏览器标题
    return (
        <div>
            <WelcomeHeader/>
            <div className="flex_center_center_column" style={{width: "100%"}}>
                <div
                    //   className="flex_center_center_column"
                    style={{
                        width: "40%",
                        padding: "50px 55px 30px",
                        boxSizing: "border-box",
                        margin: "93px 0 19px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        boxShadow:
                            "0px 1px 1px 1px rgba(223.26, 230.95, 230.02, 0.50) inset",
                        borderRadius: 16,
                        backdropFilter: "blur(8px)"
                    }}>
                    <div
                        style={{
                            fontSize: 40,
                            fontWeight: 700,
                            textAlign: "center",
                            padding: "0 5%"
                        }}>
                        {intl.formatMessage({id: "your_wallet_install_is_complete"})}
                    </div>
                    {stepIndex === 0 ? (
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 400,
                                textAlign: "center",
                                padding: "12px 5% 5px",
                                boxSizing: "border-box"
                            }}>
                            {intl.formatMessage({
                                id: "your_wallet_install_is_complete_tip"
                            })}
                        </div>
                    ) : (
                        <div>
                            <div
                                style={{
                                    fontSize: 14,
                                    fontWeight: 400,
                                    textAlign: "center",
                                    padding: "12px 5% 5px",
                                    boxSizing: "border-box",
                                    lineHeight: 1.5
                                }}>
                                {intl.formatMessage({
                                    id: "your_wallet_install_is_complete_tip1"
                                })}
                                <br/>{" "}
                                {intl.formatMessage({
                                    id: "your_wallet_install_is_complete_tip2"
                                })}
                            </div>
                        </div>
                    )}
                    {/* <Swiper>
            <SwiperSlide>Slide 1</SwiperSlide>
            <SwiperSlide>Slide 2</SwiperSlide>
            <SwiperSlide>Slide 3</SwiperSlide>
          </Swiper> */}
                    {stepIndex === 0 ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                margin: "32px 0 30px"
                            }}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "flex-start",
                                    alignItems: "center",
                                    marginRight: "30px"
                                }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                        marginBottom: "15px"
                                    }}>
                                    <div
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            lineHeight: "16px",
                                            borderRadius: "8px",
                                            textAlign: "center",
                                            backgroundColor: "#3EDFCF",
                                            color: "#FFFEFB",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            marginRight: "6px"
                                        }}>
                                        1
                                    </div>
                                    <div style={{fontSize: "15px"}}>
                                        {intl.formatMessage({
                                            id: "click_the_browser_extension_icon"
                                        })}
                                    </div>
                                </div>
                                <img
                                    src={GuideImage1}
                                    alt=""
                                    style={{width: "240px", height: "131"}}
                                />
                            </div>
                            <div style={{marginTop: "20px"}}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                        marginBottom: "15px"
                                    }}>
                                    <div
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            lineHeight: "16px",
                                            borderRadius: "8px",
                                            textAlign: "center",
                                            backgroundColor: "#3EDFCF",
                                            color: "#FFFEFB",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            marginRight: "6px"
                                        }}>
                                        2
                                    </div>
                                    <div>
                                        {intl.formatMessage({
                                            id: "pin_utility_wallet"
                                        })}
                                    </div>
                                </div>
                                <img
                                    src={GuideImage2}
                                    alt=""
                                    style={{width: "239px", height: "133px"}}
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "24px 0 38px"
                            }}>
                            <img
                                src={GuideImage3}
                                alt=""
                                style={{width: "484px", height: "165px"}}
                            />
                        </div>
                    )}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                        <div
                            style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "3px",
                                backgroundColor: "#3EDFCF",
                                opacity: stepIndex === 0 ? "1" : "0.4",
                                margin: "0 4px"
                            }}></div>
                        <div
                            style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "3px",
                                backgroundColor: "#3EDFCF",
                                opacity: stepIndex === 1 ? "1" : "0.4",
                                margin: "0 4px"
                            }}></div>
                    </div>
                </div>
                <div
                    onMouseOver={mouseOver}
                    onMouseOut={mouseOut}
                    onClick={toNext}
                    style={{
                        width: "max-content",
                        padding: "10px 30px",
                        borderRadius: 6,
                        border: "1px #3EDFCF solid",
                        textAlign: "center",
                        color: "rgba(21.29, 27.63, 26.10, 0.90)",
                        fontSize: 14,
                        fontFamily: "Inter",
                        fontWeight: "500",
                        wordWrap: "break-word",
                        cursor: "pointer"
                    }}>
                    {stepIndex === 0
                        ? intl.formatMessage({
                            id: "next_step"
                        })
                        : intl.formatMessage({
                            id: "done"
                        })}
                </div>
            </div>
        </div>
    )
}

export default GuidePages
