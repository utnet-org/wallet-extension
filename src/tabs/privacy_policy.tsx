import "../style.css"

import logoImg from "data-base64:~assets/images/help_improve_utility.png"
import React, { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import WelcomeHeader from "../compoments/welcome_header"
import { createIntlObject } from "../i18n"
import TopStorage from "~db/user_storage";

function PrivacyPolicy() {
  const storage = new Storage({
    area: "local"
  })
  const [routeParams, setRouteParams] = useState("")
  const [agreeIsHovered, setAgreeIsHovered] = useState(false)
  const [negativeIsHovered, setNegativeIsHovered] = useState(false)
  const [intl, setIntl] = useState(() => {
    // 初始化时根据浏览器语言创建 intl 对象
    const userLanguage = navigator.language.toLowerCase()
    return createIntlObject(userLanguage)
  })
  const agreeHandleMouseOver = () => {
    setAgreeIsHovered(true)
  }

  const agreeHandleMouseOut = () => {
    setAgreeIsHovered(false)
  }
  const negativeHandleMouseOver = () => {
    setNegativeIsHovered(true)
  }

  const negativeHandleMouseOut = () => {
    setNegativeIsHovered(false)
  }
  // 解析URL参数的简单函数
  function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&")
    const regex = new RegExp("[?]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ""
    return results[2]
  }
  useEffect(() => {
    console.log("routeParams==============>", routeParams)
    if (routeParams == "create") {
      chrome.tabs.update({ url: "tabs/create_new_wallet.html" })
    }
    if (routeParams == "import") {
      chrome.tabs.update({ url: "tabs/import_wallet.html" })
    }
  }, [routeParams])

  const checkCurrentLanguage = async () => {
      const userLanguage = await TopStorage.getCurrentLanguage()
      setIntl(createIntlObject(userLanguage))
  }
  useEffect(() => {
      checkCurrentLanguage().catch((error) => {
          console.error("An error occurred:", error)
      })
  }, [storage])

  const toNext = () => {
    // 获取URL中的参数值
    const param1Value = getParameterByName("from", window.location.search)
    setRouteParams(param1Value)
  }
  document.title = "Privacy Policy"
  return (
    <div>
      <WelcomeHeader />
      <div className="flex_center_center_column" style={{ width: "100%" }}>
        <img src={logoImg} alt={`Slide`} style={{ width: "70%" }} />
        <div className="flex_center_center" style={{ margin: "18px 0" }}>
          <div
            style={{
              color: "rgba(21.29,27.63,26.10,0.90)",
              fontSize: "60px",
              fontFamily: "Lantinghei SC",
              fontWeight: "400",
              lineHeight: "90px",
              whiteSpace: "nowrap"
            }}>
            {intl.formatMessage({ id: "help_improve" })}
          </div>
          <div
            style={{
              color: "#3EDFCF",
              fontSize: "60px",
              fontFamily: "Lantinghei SC",
              fontWeight: "400",
              lineHeight: "90px",
              wordWrap: "break-word",
              marginLeft: "4%"
            }}>
            Utility
          </div>
        </div>
        <div
          className="text_description_16_400"
          style={{ width: "40%", marginBottom: "40px" }}>
          {intl.formatMessage({ id: "help_improve_title" })}
        </div>
        <div className="flex_center_center">
          <div
            className="button_Inter_14_500"
            style={{
              border: "1px solid #3EDFCF",
              borderRadius: "6px",
              padding: "12px 24px",
              marginRight: "15%",
              whiteSpace: "nowrap",
              cursor: "pointer",
              backgroundColor: agreeIsHovered ? "#3EDFCF" : "white"
            }}
            onMouseOver={agreeHandleMouseOver}
            onMouseOut={agreeHandleMouseOut}
            onClick={toNext}>
            {intl.formatMessage({ id: "agree" })}
          </div>
          <div
            className="button_Inter_14_500"
            style={{
              border: "1px solid #3EDFCF",
              borderRadius: "6px",
              padding: "12px 24px",
              whiteSpace: "nowrap",
              cursor: "pointer",
              backgroundColor: negativeIsHovered ? "#3EDFCF" : "white"
            }}
            onMouseOver={negativeHandleMouseOver}
            onMouseOut={negativeHandleMouseOut}
            onClick={toNext}>
            {intl.formatMessage({ id: "no_thanks" })}
          </div>
        </div>
      </div>
    </div>
  )
}
export default PrivacyPolicy
