import "../style.css"

import checkIcon from "data-base64:~assets/icons/check_square.png"
import uncheckIcon from "data-base64:~assets/icons/uncheck_square.png"
import React, { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import { CustomAlert } from "~utils/hint"

import Carousel from "../compoments/carousel"
import WelcomeHeader from "../compoments/welcome_header"
import { createIntlObject } from "../i18n"
import TopStorage from "~db/user_storage";

function IndexWelcome() {
  const storage = new Storage({
    area: "local"
  })
  const [alertType, setAlertType] = useState("") //提示的类型
  const [showCustomAlert, setShowCustomAlert] = useState(false) //是否显示提示
  const [customAlertMessage, setCustomAlertMessage] = useState("") //提示文字内容

  const [intl, setIntl] = useState(() => {
    // 初始化时根据浏览器语言创建 intl 对象
    const userLanguage = navigator.language.toLowerCase()
    return createIntlObject(userLanguage)
  })

  const checkCurrentLanguage = async () => {
    const userLanguage = await TopStorage.getCurrentLanguage()
    setIntl(createIntlObject(userLanguage))
  }

  useEffect(() => {
    // 在组件挂载后检查当前语言
    checkCurrentLanguage().catch((error) => {
      console.error("An error occurred:", error)
    })
  }, [storage])

  const [isChecked, setIsChecked] = useState(false)

  const handleCheckClick = () => {
    setIsChecked(!isChecked) // 将 isChecked 的值取反
  }

  const handleTermsClick = () => {
    chrome.tabs.update({ url: "tabs/terms_of_service.html" })
  }
  const toCreateWallet = () => {
    if (isChecked) {
      chrome.tabs.update({ url: "tabs/ask_help_improve.html?from=create" })
    } else {
      setAlertType("error")
      setShowCustomAlert(true)
      setCustomAlertMessage(
        intl.formatMessage({ id: "please_read_and_check_the_agreement" })
      )
      setTimeout(() => {
        // 这里是要执行的代码块
        setShowCustomAlert(false)
      }, 2000)
    }
  }
  const toImportWallet = () => {
    if (isChecked) {
      chrome.tabs.update({ url: "tabs/ask_help_improve.html?from=import" })
    } else {
      setAlertType("error")
      setShowCustomAlert(true)
      setCustomAlertMessage(
        intl.formatMessage({ id: "please_read_and_check_the_agreement" })
      )
      setTimeout(() => {
        // 这里是要执行的代码块
        setShowCustomAlert(false)
      }, 2000)
    }
  }
  const btn1MouseOver = (e) => {
    e.target.style.background = "#3EDFCF"
  }

  const btn1MouseOut = (e) => {
    e.target.style.background = "transparent"
  }
  const btn2MouseOver = (e) => {
    e.target.style.background = "#3EDFCF"
  }

  const btn2MouseOut = (e) => {
    e.target.style.background = "transparent"
  }
  document.title = "Welcome to Utility1"
  return (
    <div className="welcome_page">
      {/* 没有遮罩层的提示 */}
      {showCustomAlert && (
        <CustomAlert
          message={customAlertMessage}
          type={alertType}
          onclick={() => {}}
        />
      )}
      <WelcomeHeader />
      <Carousel />
      <div
        className="flex_center_center"
        style={{ marginTop: "5%", marginBottom: "2.5%" }}>
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
        <div
          className="text_black_14_400"
          style={{ marginRight: "7px", marginLeft: "7px" }}>
          {intl.formatMessage({ id: "i_agree_to_the" })}
        </div>
        <div
          className="text_primary_14_400"
          style={{ textDecoration: "underline", cursor: "pointer" }}
          onClick={handleTermsClick}>
          {intl.formatMessage({ id: "utility_terms_of_service" })}
        </div>
      </div>
      <div className="flex_center_center">
        <div
          className="primary_outline_button text_black_14_500"
          style={{
            marginRight: "1.5%",
            marginLeft: "1.5%",
            cursor: "pointer"
          }}
          onMouseOver={btn1MouseOver}
          onMouseOut={btn1MouseOut}
          onClick={toCreateWallet}>
          {intl.formatMessage({ id: "create_new_wallet" })}
        </div>
        <div
          className="primary_outline_button text_black_14_500"
          style={{ marginRight: "1.5%", marginLeft: "1.5%", cursor: "pointer" }}
          onMouseOver={btn2MouseOver}
          onMouseOut={btn2MouseOut}
          onClick={toImportWallet}>
          {intl.formatMessage({ id: "import_existing_wallet" })}
        </div>
      </div>
    </div>
  )
}

export default IndexWelcome
