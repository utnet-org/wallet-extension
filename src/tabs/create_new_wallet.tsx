import "../style.css"

import checkIcon from "data-base64:~assets/icons/check_square.png"
import closeEyeImage from "data-base64:~assets/icons/close_eye.png"
import copyImage from "data-base64:~assets/icons/copy.png"
import createWalletPoint from "data-base64:~assets/icons/create_wallet_point.png"
import eyeCloseImage from "data-base64:~assets/icons/eye_close.png"
import openEyeImage from "data-base64:~assets/icons/open_eye.png"
import uncheckIcon from "data-base64:~assets/icons/uncheck_square.png"
import logoImg from "data-base64:~assets/images/help_improve_utility.png"
import checkStepImage from "data-base64:~assets/svgs/create_wallet_step_check.svg"
import defalutStepImage from "data-base64:~assets/svgs/create_wallet_step_defalut.svg"
import React, { useEffect, useState } from "react"
import { CustomAlert, MaskAlert } from "src/utils/hint"

import { Storage } from "@plasmohq/storage"

import { createIntlObject } from "~i18n"

import WelcomeHeader from "../compoments/welcome_header"
import TopStorage from "../db/user_storage"

function CreateWallet() {
  const storage = new Storage({
    area: "local"
  })
  const [intl, setIntl] = useState(() => {
    // 初始化时根据浏览器语言创建 intl 对象
    const userLanguage = navigator.language.toLowerCase()
    return createIntlObject(userLanguage)
  })
  const bip39 = require("bip39")
  const { derivePath } = require("near-hd-key")
  const nacl = require("tweetnacl")
  const bs58 = require("bs58")
  const [firstPasswordOpenPage, setFirstPasswordOpenPage] = useState(true) //第一次打开页面首次密码提示状态
  const [secondPasswordOpenPage, setSecondPasswordOpenPage] = useState(true) //第一次打开页面再次密码提示状态
  const [stepIndex, setStepIndex] = useState(0) //步骤下标
  const [lastStepNext, setLastStepNext] = useState(0) //最后一步下一步按钮状态
  const [firstPassword, setFirstPassword] = useState("") //第一次密码
  const [firstPasswordType, setFirstPasswordType] = useState("password") //第一次密码显示类型
  const [firstPasswordStrength, setFirstPasswordStrength] = useState(-1) //第一次密码强度[0,1,2]
  const [secondPassword, setSecondPassword] = useState("") //第二次密码
  const [secondPasswordType, setSecondPasswordType] = useState("password") //第二次密码显示类型
  const stepText = [
    intl.formatMessage({ id: "create_password" }),
    intl.formatMessage({ id: "safe_wallet" }),
    intl.formatMessage({ id: "confirm_your_secret_recovery_phrase" })
  ]
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
  const lowercaseRegex = /[a-z]/
  const uppercaseRegex = /[A-Z]/
  const digitRegex = /\d/
  const symbolRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/
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
  const setSecondPasswordValue = (value: string) => {
    setSecondPasswordOpenPage(false)
    setSecondPassword(value)
  }
  // 使用状态来控制复选框的选中状态
  const [isChecked, setIsChecked] = useState(false)
  // 第一步确认按钮鼠标悬停状态变量
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseOver = () => {
    setIsHovered(true)
  }

  const handleMouseOut = () => {
    setIsHovered(false)
  }
  const createNewWallet = async (step) => {
    console.log(step)
    setFirstPasswordOpenPage(false)
    setSecondPasswordOpenPage(false)
    // 第一步创建新钱包按钮触发的事件
    if (step === 1) {
      if (firstPassword != "" || secondPassword != "") {
        if (firstPassword.length < 8) {
          setAlertType("error")
          setShowCustomAlert(true)
          setCustomAlertMessage(
            intl.formatMessage({
              id: "the_password_length_cannot_be_less_than_8_characters"
            })
          )
        } else if (firstPassword != secondPassword) {
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
          TopStorage.setCreatePassword(firstPassword) // 保存密码
          const mnemonic = bip39.generateMnemonic()
          TopStorage.setMnemonicPhrase(mnemonic) // 保存助记词
          const myMnemonic = await TopStorage.getMnemonicPhrase()
          setObtainMnemonic(myMnemonic)
          console.log(myMnemonic.split(" "))
          setMnemonicPhraseList(myMnemonic.split(" "))
          //   通过助记词获取种子
          const seed = bip39.mnemonicToSeedSync(mnemonic)
          const KEY_DERIVATION_PATH = "m/44'/397'/0'"
          const { key } = derivePath(KEY_DERIVATION_PATH, seed.toString("hex"))
          const newKeyPair = nacl.sign.keyPair.fromSeed(key)
          TopStorage.setPrivateKey(
            bs58.encode(Buffer.from(newKeyPair.secretKey))
          ) // 保存私钥
          TopStorage.setPublicKey(
            bs58.encode(Buffer.from(newKeyPair.publicKey))
          ) // 保存公钥
          const implicitAccountId = Buffer.from(newKeyPair.publicKey).toString(
            "hex"
          )
          TopStorage.setMyAddress(implicitAccountId) // 保存地址
          TopStorage.setHasCreatedWallet("true") // 保存是否创建钱包
          console.log(implicitAccountId)
          console.log(bs58.encode(Buffer.from(newKeyPair.secretKey)))
          setStepIndex(1)
        }
        setTimeout(() => {
          // 这里是要执行的代码块
          setShowCustomAlert(false)
        }, 2000)
      }
    }
    // 第二步稍后提醒我的按钮触发事件
    if (step === 2) {
      setIsChecked(false)
      setAlertType("warn")
      setMaskAlertMessage(
        intl.formatMessage({
          id: "skip_account_security"
        })
      )
      setProtocol(
        intl.formatMessage({
          id: "skip_account_security_protocol"
        })
      )
      setShowMaskAlert(true)
    }
    // 第二步保护我的钱包按钮触发事件
    if (step === 3) {
      // 生成助记词
      setStepIndex(2)
    }
  }
  const closeAlert = () => {
    // console.log(showCustomAlert)
    // setShowCustomAlert(false)
  }
  const secondStepBtn1MouseOver = (e) => {
    e.target.style.background = "#3EDFCF"
  }

  const secondStepBtn1MouseOut = (e) => {
    e.target.style.background = "white"
  }
  // 保护钱包按钮悬停
  const secondStepBtn2MouseOver = (e) => {
    e.target.style.background = "#3EDFCF"
  }
  // 保护钱包按钮失焦
  const secondStepBtn2MouseOut = (e) => {
    e.target.style.background = "white"
  }
  const handleCheckClick = () => {
    setIsChecked(!isChecked) // 将 isChecked 的值取反
  }
  const generateMnemonicWords = (step) => {
    setMnemonicPhraseStep(step)
  }
  const [alertType, setAlertType] = useState("") //提示的类型
  const [showCustomAlert, setShowCustomAlert] = useState(false) //是否显示提示
  const [maskAlertMessage, setMaskAlertMessage] = useState("") //提示文字内容
  const [showMaskAlert, setShowMaskAlert] = useState(false) //是否显示遮罩层提示
  const [protocol, setProtocol] = useState("") //协议内容
  const [customAlertMessage, setCustomAlertMessage] = useState("") //提示文字内容
  const [mnemonicPhraseStep, setMnemonicPhraseStep] = useState(0) //助记词
  const [obtainMnemonic, setObtainMnemonic] = useState("") //动态获取到的助记词
  const [mnemonicPhraseList, setMnemonicPhraseList] = useState([
    "sustain",
    "sustain",
    "sustain",
    "sustain",
    "sustain",
    "sustain",
    "sustain",
    "sustain",
    "sustain",
    "sustain",
    "sustain",
    "sustain"
  ]) //助记词列表
  const [mnemonicPhraseMask, setMnemonicPhraseMask] = useState(false) //显示隐藏助记词
  const hiddrenMnemonicPhrase = () => {
    setMnemonicPhraseMask(!mnemonicPhraseMask)
  }
  const copyMnemonicPhrase = () => {
    const input = document.createElement("input")
    input.setAttribute("readonly", "readonly")
    input.setAttribute("value", mnemonicPhraseList.join(" "))
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
  const areArraysEqual = (arr1, arr2) => {
    // 确保两个数组的长度相同
    if (arr1.length !== arr2.length) {
      return false
    }

    // 使用 every 方法检查所有位置上的值是否相同
    const areEqual = arr1.every((value, index) => value === arr2[index])

    return areEqual
  }
  const lastStepToNext = () => {
    setMnemonicPhraseMask(false)
    if (lastStepNext === 0) {
      const newArray = [...mnemonicPhraseList]
      newArray[3] = ""
      newArray[6] = ""
      newArray[9] = ""
      // 更新状态
      setMnemonicPhraseList(newArray)
    }
    if (lastStepNext === 1) {
      console.log(mnemonicPhraseList)
      const newArray = obtainMnemonic.split(" ")
      console.log(newArray)
      // 使用 every 方法检查所有位置上的值是否相同
      const result = areArraysEqual(mnemonicPhraseList, newArray)
      console.log(result)
      if (!result) {
        setAlertType("error")
        setShowCustomAlert(true)
        setCustomAlertMessage(
          intl.formatMessage({
            id: "mnemonic_phrase_error"
          })
        )
        setTimeout(() => {
          // 这里是要执行的代码块
          setShowCustomAlert(false)
        }, 2000)
        return
      } else {
        chrome.tabs.update({ url: "tabs/create_new_wallet_success.html" })
      }
      return
    }
    setLastStepNext(lastStepNext + 1)
  }
  const isDisabled = (index) => {
    if (lastStepNext != 0) {
      if (index === 3 || index === 6 || index === 9) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  }
  const changeItemMonicPhrase = (e, index) => {
    const newArray = [...mnemonicPhraseList]
    newArray[index] = e.target.value
    // 更新状态
    setMnemonicPhraseList(newArray)
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

  document.title = "Create a new wallet" //浏览器标题
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
      {/* 有遮罩层的提示 */}
      {showMaskAlert && (
        <MaskAlert
          message={maskAlertMessage}
          type={alertType}
          protocol={protocol}
          isChecked={isChecked}
          onclick={closeAlert}
          clickBack={() => {
            setShowMaskAlert(false)
          }}
          clickSkip={(isChecked) => {
            if (isChecked) {
              setShowMaskAlert(false)
              chrome.tabs.update({ url: "tabs/create_new_wallet_success.html" })
            } else {
              setAlertType("error")
              setShowCustomAlert(true)
              setCustomAlertMessage(
                intl.formatMessage({
                  id: "please_read_and_check_the_agreement"
                })
              )
              setTimeout(() => {
                // 这里是要执行的代码块
                setShowCustomAlert(false)
              }, 2000)
            }
          }}
          handleCheckClick={handleCheckClick}
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
        {/* form内容 */}
        {stepIndex == 0 ? (
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
              {intl.formatMessage({ id: "create_password" })}
            </div>
            {/* 说明 */}
            <div
              style={{
                margin: "12px 0 44px",
                textAlign: "center",
                fontSize: 14,
                fontWeight: 400
              }}>
              {intl.formatMessage({ id: "create_password_title" })}
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
                  {intl.formatMessage({ id: "create_new_password_title" })}
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
        ) : stepIndex == 1 ? (
          // 第二步
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
                padding: "55px 86px 30px",
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
                {intl.formatMessage({ id: "keep_your_wallet_safe" })}
              </div>
              {/* 说明 */}
              <div
                style={{
                  margin: "12px 0 5px",
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 400
                }}>
                {intl.formatMessage({ id: "keep_your_wallet_safe_title" })}
              </div>
              <div
                style={{
                  width: "100%",
                  padding: "20px",
                  marginTop: "10px",
                  borderRadius: 10,
                  border: "1px rgba(205, 206, 206, 0.30) solid",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                <div
                  style={{
                    color: "rgba(21.29, 27.63, 26.10, 0.90)",
                    fontSize: 16,
                    fontWeight: 600,
                    wordWrap: "break-word",
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                    marginBottom: "8px"
                  }}>
                  <img
                    src={createWalletPoint}
                    alt=""
                    style={{
                      width: "12px",
                      height: "12px",
                      marginRight: "6px"
                    }}
                  />
                  <div>
                    {intl.formatMessage({
                      id: "what_is_a_secret_recovery_phrase"
                    })}
                  </div>
                </div>
                <div
                  style={{
                    color: "rgba(21.29, 27.63, 26.10, 0.90)",
                    fontSize: 13,
                    fontWeight: 400
                  }}>
                  {intl.formatMessage({
                    id: "what_is_a_secret_recovery_phrase_answer"
                  })}
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  padding: "20px",
                  marginTop: "10px",
                  borderRadius: 10,
                  border: "1px rgba(205, 206, 206, 0.30) solid",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                <div
                  style={{
                    color: "rgba(21.29, 27.63, 26.10, 0.90)",
                    fontSize: 16,
                    fontWeight: 600,
                    wordWrap: "break-word",
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                    marginBottom: "8px"
                  }}>
                  <img
                    src={createWalletPoint}
                    alt=""
                    style={{
                      width: "12px",
                      height: "12px",
                      marginRight: "6px"
                    }}
                  />
                  <div>
                    {intl.formatMessage({
                      id: "how_do_i_save_my_secret_recovery_phrase"
                    })}
                  </div>
                </div>
                <div
                  style={{
                    color: "rgba(21.29, 27.63, 26.10, 0.90)",
                    fontSize: 13,
                    fontWeight: 400,
                    marginBottom: "4px",
                    marginLeft: "18px"
                  }}>
                  {intl.formatMessage({
                    id: "how_do_i_save_my_secret_recovery_phrase_answer1"
                  })}
                </div>
                <div
                  style={{
                    color: "rgba(21.29, 27.63, 26.10, 0.90)",
                    fontSize: 13,
                    fontWeight: 400,
                    marginBottom: "4px",
                    marginLeft: "18px"
                  }}>
                  {intl.formatMessage({
                    id: "how_do_i_save_my_secret_recovery_phrase_answer2"
                  })}
                </div>
                <div
                  style={{
                    color: "rgba(21.29, 27.63, 26.10, 0.90)",
                    fontSize: 13,
                    fontWeight: 400,
                    marginBottom: "4px",
                    marginLeft: "18px"
                  }}>
                  {intl.formatMessage({
                    id: "how_do_i_save_my_secret_recovery_phrase_answer3"
                  })}
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  padding: "20px",
                  marginTop: "10px",
                  borderRadius: 10,
                  border: "1px rgba(205, 206, 206, 0.30) solid",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                <div
                  style={{
                    color: "rgba(21.29, 27.63, 26.10, 0.90)",
                    fontSize: 16,
                    fontWeight: 600,
                    wordWrap: "break-word",
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                    marginBottom: "8px"
                  }}>
                  <img
                    src={createWalletPoint}
                    alt=""
                    style={{
                      width: "12px",
                      height: "12px",
                      marginRight: "6px"
                    }}
                  />
                  <div>
                    {intl.formatMessage({
                      id: "should_i_share_my_secret_recovery_phrase"
                    })}
                  </div>
                </div>
                <div
                  style={{
                    color: "rgba(21.29, 27.63, 26.10, 0.90)",
                    fontSize: 13,
                    fontWeight: 400
                  }}>
                  {intl.formatMessage({
                    id: "should_i_share_my_secret_recovery_phrase_answer"
                  })}
                </div>
              </div>
            </div>
            <div
              style={{
                width: "40%",
                padding: "19px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly"
              }}>
              <div
                onMouseOver={secondStepBtn1MouseOver}
                onMouseOut={secondStepBtn1MouseOut}
                onClick={() => createNewWallet(2)}
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
                  id: "not_recommended"
                })}
              </div>
              <div
                onMouseOver={secondStepBtn2MouseOver}
                onMouseOut={secondStepBtn2MouseOut}
                onClick={() => createNewWallet(3)}
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
                  id: "recommended"
                })}
              </div>
            </div>
          </div>
        ) : (
          // 第三步
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
                  id: "remember_your_secret_recovery_phrase"
                })}
              </div>
              {/* 说明 */}
              {lastStepNext === 0 ? (
                <div
                  style={{
                    margin: "12px 5px 5px",
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: 400
                  }}>
                  {intl.formatMessage({
                    id: "remember_your_secret_recovery_phrase_tip"
                  })}
                </div>
              ) : (
                <div
                  style={{
                    margin: "12px 0px 15px",
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: 400
                  }}>
                  {intl.formatMessage({
                    id: "confirm_your_secret_recovery_phrase"
                  })}
                </div>
              )}
              {lastStepNext === 0 ? (
                <div
                  style={{
                    width: "100%",
                    padding: "20px",
                    margin: "15px 0px 10px",
                    borderRadius: 10,
                    border: "1px rgba(205, 206, 206, 0.30) solid",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxSizing: "border-box"
                  }}>
                  <div
                    style={{
                      color: "rgba(21.29, 27.63, 26.10, 0.90)",
                      fontSize: 16,
                      fontWeight: 600,
                      wordWrap: "break-word",
                      display: "flex",
                      justifyContent: "start",
                      alignItems: "center",
                      marginBottom: "8px"
                    }}>
                    <img
                      src={createWalletPoint}
                      alt=""
                      style={{
                        width: "12px",
                        height: "12px",
                        marginRight: "6px"
                      }}
                    />
                    <div>
                      {intl.formatMessage({
                        id: "reminder"
                      })}
                    </div>
                  </div>
                  <div
                    style={{
                      color: "rgba(21.29, 27.63, 26.10, 0.90)",
                      fontSize: 13,
                      fontWeight: 400,
                      marginBottom: "4px",
                      marginLeft: "18px"
                    }}>
                    {intl.formatMessage({
                      id: "remember_your_secret_recovery_phrase_tip1"
                    })}
                  </div>
                  <div
                    style={{
                      color: "rgba(21.29, 27.63, 26.10, 0.90)",
                      fontSize: 13,
                      fontWeight: 400,
                      marginBottom: "4px",
                      marginLeft: "18px"
                    }}>
                    {intl.formatMessage({
                      id: "remember_your_secret_recovery_phrase_tip2"
                    })}
                  </div>
                  <div
                    style={{
                      color: "rgba(21.29, 27.63, 26.10, 0.90)",
                      fontSize: 13,
                      fontWeight: 400,
                      marginBottom: "4px",
                      marginLeft: "18px"
                    }}>
                    {intl.formatMessage({
                      id: "remember_your_secret_recovery_phrase_tip3"
                    })}
                  </div>
                </div>
              ) : (
                <div></div>
              )}

              {mnemonicPhraseStep === 0 ? (
                <div
                  style={{
                    width: "100%",
                    height: "155px",
                    background: "rgba(21.29, 27.63, 26.10, 0.90)",
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#3EDFCF",
                    fontSize: "14px",
                    fontWeight: 600
                  }}>
                  {intl.formatMessage({
                    id: "make_sure_no_one_is_looking_at_your_screen"
                  })}
                </div>
              ) : (
                <div style={{ width: "100%" }}>
                  {mnemonicPhraseMask ? (
                    <div
                      style={{
                        width: "100%",
                        height: "155px",
                        background: "rgba(21.29, 27.63, 26.10, 0.90)",
                        borderRadius: 10,
                        marginBottom: "10px"
                      }}></div>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        padding: "20px",
                        marginBottom: "10px",
                        borderRadius: 10,
                        border: "1px rgba(205, 206, 206, 0.30) solid",
                        // display: "grid",
                        // gridTemplateColumns: "repeat(5, 1fr)",
                        // gridTemplateRows: "repeat(3, 1fr)",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-evenly",
                        alignItems: "center",
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
                            disabled={isDisabled(index)}
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
                              border: isDisabled(index)
                                ? "1px #ecece8 solid"
                                : "1px #6e716f solid",
                              marginLeft: "5px"
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {lastStepNext === 0 ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}>
                      <div
                        onClick={hiddrenMnemonicPhrase}
                        className="flex_center_center"
                        style={{ color: "#3EDFCF", cursor: "pointer" }}>
                        <img
                          src={eyeCloseImage}
                          alt=""
                          style={{
                            width: "20px",
                            height: "20px",
                            marginRight: "4px"
                          }}
                        />
                        <div>
                          {intl.formatMessage({
                            id: "hide_secret_recovery_phrase"
                          })}
                        </div>
                      </div>
                      <div
                        onClick={copyMnemonicPhrase}
                        className="flex_center_center"
                        style={{ color: "#3EDFCF", cursor: "pointer" }}>
                        <img
                          src={copyImage}
                          alt=""
                          style={{
                            width: "20px",
                            height: "20px",
                            marginRight: "4px"
                          }}
                        />
                        <div>
                          {intl.formatMessage({
                            id: "paste_to_clipboard"
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              )}
            </div>
            {mnemonicPhraseStep === 0 ? (
              <div
                style={{
                  width: "40%",
                  padding: "9px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                <div
                  onMouseOver={secondStepBtn1MouseOver}
                  onMouseOut={secondStepBtn1MouseOut}
                  onClick={() => generateMnemonicWords(1)}
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
                    id: "show_secret_recovery_phrase"
                  })}
                </div>
              </div>
            ) : (
              <div
                style={{
                  width: "40%",
                  padding: "9px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                <div
                  onMouseOver={secondStepBtn1MouseOver}
                  onMouseOut={secondStepBtn1MouseOut}
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
                    id: "next_step"
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {/* 协议 */}
        {stepIndex == 0 ? (
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
              {intl.formatMessage({ id: "create_password_protocol" })}
            </div>
          </div>
        ) : (
          <div></div>
        )}
        {/* 创建钱包按钮 */}
        {stepIndex == 0 ? (
          <div
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            onClick={() => createNewWallet(1)}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "rgba(21.29, 27.63, 26.10, 0.90)",
              padding: "12px 18px",
              marginTop: "30px",
              borderRadius: 6,
              cursor: "pointer",
              border: "1px #3EDFCF solid",
              backgroundColor: isHovered ? "#3EDFCF" : "white"
            }}>
            {intl.formatMessage({ id: "create_new_wallet" })}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  )
}
export default CreateWallet
