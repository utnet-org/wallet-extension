import "../style.css"

import AboutImage from "data-base64:~assets/icons/About.png"
import AdvancedImage from "data-base64:~assets/icons/Advanced.png"
import GeneralImage from "data-base64:~assets/icons/General.png"
import GetBackImage from "data-base64:~assets/icons/get_back.png"
import SearchImage from "data-base64:~assets/icons/search_lg.png"
import SecurityPrivacyImage from "data-base64:~assets/icons/Security&Privacy.png"
import ToRightImage from "data-base64:~assets/icons/to_right.png"
import CloseImage from "data-base64:~assets/icons/x_close.png"
import React, { useEffect, useState } from "react"
import {
  Link,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom"

import { createIntlObject } from "~i18n"
import TopStorage from "~db/user_storage";

function Setting() {
  const [intl, setIntl] = useState(() => {
    // 初始化时根据浏览器语言创建 intl 对象
    const userLanguage = navigator.language.toLowerCase()
    return createIntlObject(userLanguage)
  })
  document.title = "Setting"
  const navigate = useNavigate()
  const [settingList, setSettingList] = useState([
    {
      name: "General",
      path: "general",
      icon: GeneralImage
    },
    {
      name: "Advanced",
      path: "advanced",
      icon: AdvancedImage
    },
    {
      name: "Security & Privacy",
      path: "security_privacy",
      icon: SecurityPrivacyImage
    },
    {
      name: "About",
      path: "about",
      icon: AboutImage
    }
  ])
  const toNext = (path: string) => {
    console.log(location.pathname)
    navigate("/tabs/home.html#" + path)
    // chrome.tabs.update({ url: "pages/seting/" + path + ".html" })
    // navigate(path)
  }

  const checkCurrentLanguage = async () => {
      const userLanguage = await TopStorage.getCurrentLanguage()
      setIntl(createIntlObject(userLanguage))
  }

  useEffect(() => {
      checkCurrentLanguage().catch((error) => {
          console.error("An error occurred:", error)
      })
  }, [])

  return (
    <div
      style={{
        width: "327px",
        height: "510px",
        display: "flex",
        flexDirection: "column"
      }}>
      <div
        style={{
          height: "63px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
        <img
          onClick={() => {
            navigate(-1)
          }}
          src={GetBackImage}
          alt=""
          style={{
            width: "24px",
            height: "24px"
          }}
        />
        <div
          style={{
            textAlign: "center",
            color: "rgba(21.29, 27.63, 26.10, 0.90)",
            fontSize: 18,
            fontFamily: "Lantinghei SC",
            fontWeight: "600",
            wordWrap: "break-word"
          }}>
          {intl.formatMessage({
            id: "settings"
          })}
        </div>
        <img
          onClick={() => {
            navigate(-1)
          }}
          src={CloseImage}
          alt=""
          style={{ width: "20px", height: "20px" }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 13px",
          marginBottom: "12px",
          borderRadius: "6px",
          backgroundColor: "rgba(246, 249, 249, 1)"
        }}>
        <img
          src={SearchImage}
          alt=""
          style={{ width: "21px", height: "21px" }}
        />
        <input
          className="custom_input"
          type="text"
          placeholder={intl.formatMessage({
            id: "search"
          })}
          style={{
            border: "none",
            flex: 1,
            marginLeft: "8px",
            backgroundColor: "transparent"
          }}
        />
      </div>
      {settingList.map((item, index) => (
        <div
          key={index}
          onClick={() => toNext(item.path)}
          style={{
            width: "100%",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={item.icon}
              alt=""
              style={{ width: "24px", height: "24px", marginRight: "10px" }}
            />
            <div style={{ fontSize: 16, fontWeight: 400 }}>
              {intl.formatMessage({
                id: item.path
              })}
            </div>
          </div>
          <img
            src={ToRightImage}
            alt=""
            style={{ width: "24px", height: "24px" }}
          />
        </div>
      ))}
    </div>
  )
}

export default Setting
