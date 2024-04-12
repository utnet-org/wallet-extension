import checkIcon from "data-base64:~assets/icons/check_square.png"
import closeEyeImage from "data-base64:~assets/icons/close_eye.png"
import openEyeImage from "data-base64:~assets/icons/open_eye.png"
import uncheckIcon from "data-base64:~assets/icons/uncheck_square.png"
import checkStepImage from "data-base64:~assets/svgs/create_wallet_step_check.svg"
import defalutStepImage from "data-base64:~assets/svgs/create_wallet_step_defalut.svg"
import React, { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import WelcomeHeader from "~compoments/welcome_header"
import TopStorage from "~db/user_storage"
import { CustomAlert } from "~utils/hint"
import MnemonicPhraseList from "~utils/mnemonic_phrase_dictionary"

import { createIntlObject } from "../i18n"

function ForgotPasswordPage() {
  const storage = new Storage({
    area: "local"
  })
  const [intl, setIntl] = useState(() => {
    // 初始化时根据浏览器语言创建 intl 对象
    const userLanguage = navigator.language.toLowerCase()
    return createIntlObject(userLanguage)
  })
  const stepText = [
    intl.formatMessage({
      id: "confirm_your_secret_recovery_phrase"
    }),
    intl.formatMessage({
      id: "create_password"
    })
  ]
  const bip39 = require("bip39")
  const { derivePath } = require("near-hd-key")
  const nacl = require("tweetnacl")
  const bs58 = require("bs58")
  const [stepIndex, setStepIndex] = useState(0) //步骤下标
  const [firstPasswordType, setFirstPasswordType] = useState("password") //第一次密码显示类型
  const [firstPassword, setFirstPassword] = useState("") //第一次密码
  const [firstPasswordOpenPage, setFirstPasswordOpenPage] = useState(true) //第一次打开页面首次密码提示状态
  const [secondPasswordOpenPage, setSecondPasswordOpenPage] = useState(true) //第一次打开页面再次密码提示状态
  const [firstPasswordStrength, setFirstPasswordStrength] = useState(-1) //第一次密码强度[0,1,2]
  const [secondPasswordType, setSecondPasswordType] = useState("password") //第二次密码显示类型
  const [secondPassword, setSecondPassword] = useState("") //第二次密码
  const [mnemonicPhraseList, setMnemonicPhraseList] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ]) //助记词列表
  const [effectiveMnemonicPhrase, setEffectiveMnemonicPhrase] = useState(true) //有效的助记词
  // 使用状态来控制复选框的选中状态
  const [isChecked, setIsChecked] = useState(false)
  const lowercaseRegex = /[a-z]/
  const uppercaseRegex = /[A-Z]/
  const digitRegex = /\d/
  const symbolRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/
  const changeFirstPasswordType = () => {
    if (firstPasswordType === "password") {
      setFirstPasswordType("text")
    } else {
      setFirstPasswordType("password")
    }
  }
  const changeSecondPasswordType = () => {
    if (secondPasswordType === "password") {
      setSecondPasswordType("text")
    } else {
      setSecondPasswordType("password")
    }
  }
  const setSecondPasswordValue = (value: string) => {
    setSecondPasswordOpenPage(false)
    setSecondPassword(value)
  }
  const setFirstPasswordValue = (value: string) => {
    setFirstPasswordOpenPage(false)
    setFirstPassword(value)
    if (value.length >= 8) {
      // 判断密码包含的字符种类数量
      const characterCategories = [
        lowercaseRegex.test(value),
        uppercaseRegex.test(value),
        digitRegex.test(value),
        symbolRegex.test(value)
      ]
      // 统计包含的字符种类数量
      const countCategories = characterCategories.filter(
        (category) => category
      ).length
      if (countCategories === 3) {
        setFirstPasswordStrength(2)
      } else if (countCategories === 2) {
        setFirstPasswordStrength(1)
      } else if (countCategories === 1) {
        setFirstPasswordStrength(0)
      } else {
        setFirstPasswordStrength(-1)
      }
    } else {
      setFirstPasswordStrength(-1)
    }
  }
  const handleMouseOver = (e) => {
    e.target.style.background = "#3EDFCF"
  }

  const handleMouseOut = (e) => {
    e.target.style.background = "white"
  }
  const handleCheckClick = () => {
    setIsChecked(!isChecked) // 将 isChecked 的值取反
  }
  const isDisabled = (index) => {
    if (index === 3 || index === 6 || index === 9) {
      return false
    } else {
      return true
    }
  }
  const changeItemMonicPhrase = (e, index) => {
    let newArray = [...mnemonicPhraseList]
    if (e.target.value.split(" ").length === 12) {
      newArray = e.target.value.split(" ")
    } else {
      newArray[index] = e.target.value
    }
    // 更新状态
    setMnemonicPhraseList(newArray)
    if (
      newArray.every((item) => {
        return item !== ""
      })
    ) {
      setEffectiveMnemonicPhrase(
        newArray.every((item) => {
          return MnemonicPhraseList.includes(item)
        })
      )
    } else {
      setEffectiveMnemonicPhrase(true)
    }
  }
  const lastStepToNext = () => {
    if (mnemonicPhraseList.includes("")) {
      setAlertType("error")
      setShowCustomAlert(true)
      setCustomAlertMessage(
        intl.formatMessage({
          id: "please_fill_in_the_correct_mnemonic_phrase"
        })
      )
      setTimeout(() => {
        // 这里是要执行的代码块
        setShowCustomAlert(false)
      }, 2000)
      return
    }
    setStepIndex(1)
  }
  const [alertType, setAlertType] = useState("") //提示的类型
  const [showCustomAlert, setShowCustomAlert] = useState(false) //是否显示提示
  const [customAlertMessage, setCustomAlertMessage] = useState("") //提示文字内容
  const createNewWallet = async () => {
    setFirstPasswordOpenPage(false)
    setSecondPasswordOpenPage(false)
    if (firstPassword != "" || secondPassword != "") {
      if (firstPassword != secondPassword) {
        setAlertType("error")
        setShowCustomAlert(true)
        setCustomAlertMessage(
          intl.formatMessage({
            id: "password_doesnt_match"
          })
        )
      } else if (!isChecked) {
        setAlertType("error")
        setShowCustomAlert(true)
        setCustomAlertMessage(
          intl.formatMessage({
            id: "please_read_and_check_the_agreement"
          })
        )
      } else {
        const mnemonic = mnemonicPhraseList.join(" ")
        //   通过助记词获取种子
        const seed = bip39.mnemonicToSeedSync(mnemonic)
        const KEY_DERIVATION_PATH = "m/44'/397'/0'"
        const { key } = derivePath(KEY_DERIVATION_PATH, seed.toString("hex"))
        const newKeyPair = nacl.sign.keyPair.fromSeed(key)
        const implicitAccountId = Buffer.from(newKeyPair.publicKey).toString(
          "hex"
        )
        console.log(bs58.encode(Buffer.from(newKeyPair.secretKey)))
        console.log(bs58.encode(Buffer.from(newKeyPair.publicKey)))
        console.log(implicitAccountId)

        TopStorage.setMnemonicPhrase(mnemonic) // 保存助记词
        TopStorage.setCreatePassword(firstPassword) // 保存密码
        TopStorage.setPrivateKey(bs58.encode(Buffer.from(newKeyPair.secretKey))) // 保存私钥
        TopStorage.setPublicKey(bs58.encode(Buffer.from(newKeyPair.publicKey))) // 保存公钥
        TopStorage.setMyAddress(implicitAccountId) // 保存地址
        TopStorage.setHasCreatedWallet("true") // 保存是否创建钱包
        // chrome.tabs.update({ url: "tabs/home.html" })
        chrome.tabs.update({ url: "tabs/create_new_wallet_success.html" })
      }
      setTimeout(() => {
        // 这里是要执行的代码块
        setShowCustomAlert(false)
      }, 2000)
    }
  }

  const checkCurrentLanguage = async () => {
    const userLanguage = await TopStorage.getCurrentLanguage()
    if (userLanguage !== undefined) {
      // 更新 intl 对象
      setIntl(createIntlObject(userLanguage))
    }
  }
  useEffect(() => {
    checkCurrentLanguage().catch((error) => {
      console.error("An error occurred:", error)
    })
  }, [storage])

  document.title = "Reset Wallet" //浏览器标题
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
      {/* 头部 */}
      <WelcomeHeader />
      <div className="flex_center_center_column" style={{ width: "100%" }}>
        {/* 步骤条 */}
        <div
          style={{
            width: "25%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-evenly",
            margin: "82px auto 97px"
          }}>
          {stepText.map((item, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                borderTop: "1px rgba(21.29, 27.63, 26.10, 0.06) solid",
                position: "relative"
              }}>
              <div
                className="flex_center_center_column"
                // onClick={() => setStepIndex(index)}
                style={{
                  width: "100%",
                  position: "absolute",
                  top: "-22px",
                  left: 0,
                  zIndex: 2,
                  color: `${
                    stepIndex == index
                      ? "#3EDFCF"
                      : "rgba(21.29, 27.63, 26.10, 0.90)"
                  }`,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "Inter",
                  wordWrap: "break-word"
                }}>
                <div
                  className="flex_center_center"
                  style={{
                    width: "44px",
                    height: "44px",
                    backgroundImage: `url(${
                      stepIndex == index ? checkStepImage : defalutStepImage
                    })`,
                    backgroundSize: "cover",
                    marginBottom: "18px"
                  }}>
                  {index + 1}
                </div>
                <div style={{ textAlign: "center" }}>{item}</div>
              </div>
            </div>
          ))}
        </div>
        {stepIndex == 1 ? (
          // 第一步
          <div
            className="flex_center_center_column"
            style={{
              width: "40%",
              boxSizing: "border-box",
              padding: "50px 86px",
              boxShadow:
                "0px 1px 1px 1px rgba(223.26, 230.95, 230.02, 0.50) inset",
              borderRadius: 16,
              backdropFilter: "blur(8px)"
            }}>
            {/* 标题 */}
            <div
              style={{
                color: "rgba(21.29, 27.63, 26.10, 0.90)",
                fontSize: 48,
                fontFamily: "Lantinghei SC",
                fontWeight: 700,
                wordWrap: "break-word",
                textAlign: "center"
              }}>
              {intl.formatMessage({
                id: "create_password"
              })}
            </div>
            {/* 说明 */}
            <div
              style={{
                margin: "12px 0 44px",
                textAlign: "center",
                fontSize: 14,
                fontWeight: 400
              }}>
              {intl.formatMessage({
                id: "create_password_title"
              })}
            </div>
            {/* 首次密码说明 */}
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxSizing: "border-box",
                padding: "0 5%"
              }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center"
                }}>
                <div style={{ color: "rgba(21.29, 27.63, 26.10, 0.90)" }}>
                  {intl.formatMessage({
                    id: "create_new_password_title"
                  })}
                </div>
                <div style={{ color: "#3EDFCF", marginLeft: "5px" }}>
                  ({intl.formatMessage({ id: "create_new_password_subtitle" })})
                </div>
              </div>
              <img
                src={
                  firstPasswordType === "password"
                    ? closeEyeImage
                    : openEyeImage
                }
                alt=""
                style={{ width: "22px", height: "22px", cursor: "pointer" }}
                onClick={changeFirstPasswordType}
              />
            </div>
            {/* 首次密码输入框 */}
            <div
              style={{
                width: "90%",
                height: "37px",
                margin: "6px 5% 0",
                display: "flex",
                border: "1px rgba(21.29, 27.63, 26.10, 0.14) solid",
                borderRadius: "7px",
                outline: "none"
              }}>
              <input
                type={firstPasswordType}
                className="custom_input"
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: "7px",
                  padding: "0 14px",
                  boxSizing: "border-box",
                  fontSize: 14
                }}
                placeholder={intl.formatMessage({
                  id: "please_enter_password"
                })}
                value={firstPassword}
                onChange={(e) => setFirstPasswordValue(e.target.value)}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: "14px",
                  fontSize: 12,
                  fontWeight: 400
                }}>
                <div
                  style={{
                    color: "rgba(21.29, 27.63, 26.10, 0.90)",
                    fontSize: 12
                  }}>
                  {intl.formatMessage({
                    id: "password_strength"
                  })}
                </div>
                {firstPasswordStrength === 0 ? (
                  <div style={{ color: "#FF0000", marginLeft: "5px" }}>
                    {intl.formatMessage({
                      id: "weak"
                    })}
                  </div>
                ) : null}
                {firstPasswordStrength === 1 ? (
                  <div style={{ color: "#FD9215", marginLeft: "5px" }}>
                    {intl.formatMessage({
                      id: "middle"
                    })}
                  </div>
                ) : null}
                {firstPasswordStrength === 2 ? (
                  <div style={{ color: "#3EDFCF", marginLeft: "5px" }}>
                    {intl.formatMessage({
                      id: "high"
                    })}
                  </div>
                ) : null}
              </div>
            </div>
            {/* 首次密码提示 */}
            {firstPassword === "" && !firstPasswordOpenPage ? (
              <div
                style={{
                  width: "90%",
                  marginTop: "8px",
                  textAlign: "left",
                  color: "red"
                }}>
                {intl.formatMessage({
                  id: "please_enter_password"
                })}
              </div>
            ) : (
              <div></div>
            )}
            {/* 再次密码说明 */}
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxSizing: "border-box",
                padding: "0 5%",
                marginTop: "24px"
              }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500
                }}>
                <div style={{ color: "rgba(21.29, 27.63, 26.10, 0.90)" }}>
                  {intl.formatMessage({
                    id: "confirm_Password"
                  })}
                </div>
              </div>
              <img
                src={
                  secondPasswordType === "password"
                    ? closeEyeImage
                    : openEyeImage
                }
                alt=""
                style={{ width: "22px", height: "22px", cursor: "pointer" }}
                onClick={changeSecondPasswordType}
              />
            </div>
            {/* 再次密码输入框 */}
            <div
              style={{
                width: "90%",
                height: "37px",
                margin: "6px 5% 0",
                display: "flex",
                border: "1px rgba(21.29, 27.63, 26.10, 0.14) solid",
                borderRadius: "7px",
                outline: "none"
              }}>
              <input
                type={secondPasswordType}
                className="custom_input"
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: "7px",
                  padding: "0 14px",
                  fontSize: 14,
                  boxSizing: "border-box"
                }}
                placeholder={intl.formatMessage({
                  id: "please_enter_password_again"
                })}
                value={secondPassword}
                onChange={(e) => setSecondPasswordValue(e.target.value)}
              />
              {firstPassword != secondPassword && secondPassword != "" ? (
                <div
                  style={{
                    color: "#FF0000",
                    marginLeft: "5px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: "14px",
                    fontSize: 12,
                    fontWeight: 400
                  }}>
                  {intl.formatMessage({
                    id: "password_doesnt_match"
                  })}
                </div>
              ) : null}
            </div>
            {secondPassword === "" && !secondPasswordOpenPage ? (
              <div
                style={{
                  width: "90%",
                  marginTop: "8px",
                  textAlign: "left",
                  color: "red"
                }}>
                {intl.formatMessage({
                  id: "please_enter_password"
                })}
              </div>
            ) : (
              <div></div>
            )}
          </div>
        ) : (
          <div
            className="flex_center_center_column"
            style={{
              width: "100%"
            }}>
            <div
              className="flex_center_center_column"
              style={{
                width: "40%",
                // height: "427px",
                boxSizing: "border-box",
                padding: "55px 55px 28px",
                boxShadow:
                  "0px 1px 1px 1px rgba(223.26, 230.95, 230.02, 0.50) inset",
                borderRadius: 16,
                backdropFilter: "blur(8px)"
              }}>
              {/* 标题 */}
              <div
                style={{
                  color: "rgba(21.29, 27.63, 26.10, 0.90)",
                  fontSize: 40,
                  fontFamily: "Lantinghei SC",
                  fontWeight: 700,
                  wordWrap: "break-word",
                  textAlign: "center"
                }}>
                {intl.formatMessage({
                  id: "access_the_wallet_using_your_secret_recovery_phrase"
                })}
              </div>
              {/* 说明 */}
              <div
                style={{
                  margin: "12px 0px 15px",
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 400
                }}>
                {intl.formatMessage({
                  id: "access_the_wallet_using_your_secret_recovery_phrase_title"
                })}
              </div>
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    width: "100%",
                    padding: "20px",
                    marginBottom: "10px",
                    borderRadius: 10,
                    border: "1px rgba(205, 206, 206, 0.30) solid",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    // gridTemplateColumns: "repeat(5, 1fr)",
                    // gridTemplateRows: "repeat(3, 1fr)",
                    gridGap: "14px",
                    boxSizing: "border-box"
                  }}>
                  {mnemonicPhraseList.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        width: "100px",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "end",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "rgba(21.29, 27.63, 26.10, 0.90)"
                      }}>
                      {index + 1}.
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          changeItemMonicPhrase(e, index)
                        }}
                        style={{
                          maxWidth: "60px",
                          padding: "6px 6px",
                          // boxSizing: "border-box",
                          width: "max-content",
                          fontSize: 12,
                          borderRadius: 6,
                          textAlign: "center",
                          // border: "1px solid #F0F0ED",
                          border: "1px #ecece8 solid",
                          marginLeft: "5px"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {!effectiveMnemonicPhrase && (
                <div
                  style={{
                    width: "100%",
                    height: "40px",
                    backgroundColor: "#fc3851",
                    borderRadius: 5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "white"
                  }}>
                  {intl.formatMessage({
                    id: "private_key_mnemonic_is_invalid"
                  })}
                </div>
              )}
            </div>
            <div
              style={{
                width: "40%",
                padding: "9px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
              <div
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
                onClick={lastStepToNext}
                style={{
                  padding: "12px 18px",
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
                {intl.formatMessage({
                  id: "confirm_private_key_recovery_phrase"
                })}
              </div>
            </div>
          </div>
        )}
        {/* 协议 */}
        {stepIndex == 1 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "34px"
            }}>
            {isChecked && (
              <img
                src={checkIcon}
                style={{ width: "18px", height: "18px" }}
                onClick={handleCheckClick}
              />
            )}
            {!isChecked && (
              <img
                src={uncheckIcon}
                style={{ width: "18px", height: "18px" }}
                onClick={handleCheckClick}
              />
            )}
            <div style={{ fontSize: 14, marginLeft: "8px" }}>
              {intl.formatMessage({
                id: "create_password_protocol"
              })}
            </div>
          </div>
        ) : (
          <div></div>
        )}
        {/* 创建钱包按钮 */}
        {stepIndex == 1 ? (
          <div
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            onClick={createNewWallet}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "rgba(21.29, 27.63, 26.10, 0.90)",
              padding: "12px 18px",
              marginTop: "30px",
              borderRadius: 6,
              cursor: "pointer",
              border: "1px #3EDFCF solid"
            }}>
            {intl.formatMessage({
              id: "create_new_wallet"
            })}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  )
}
export default ForgotPasswordPage
