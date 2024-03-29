import { Select } from "antd"
import GetBackImage from "data-base64:~assets/icons/get_back.png"
import SearchImage from "data-base64:~assets/icons/search_lg.png"
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

import { Storage } from "@plasmohq/storage"

import { createIntlObject } from "~i18n"

import TopStorage from "../../db/user_storage"
import translations from "../../translations.json"

function GeneralPage() {
  const storage = new Storage({
    area: "local"
  })
  const [intl, setIntl] = useState(() => {
    // 初始化时根据浏览器语言创建 intl 对象
    const userLanguage = navigator.language.toLowerCase()
    return createIntlObject(userLanguage)
  })
  const navigate = useNavigate()
  const languageOptions = [
    { value: "en", label: "English" },
    { value: "zh-cn", label: "简体中文" }
  ]
  const [currentLanguage, setCurrentLanguage] = useState("")
  const [language, setLanguage] = useState("English")
  const handleChange = (value: string, option) => {
    console.log(`selected ${value}`)
    setLanguage(option.label)
    setCurrentLanguage(value)
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const locationLanguage = await TopStorage.getCurrentLanguage()
        setCurrentLanguage(locationLanguage)
        setLanguage(translations[locationLanguage]?.current_language)
      } catch (error) {
        console.error("Error fetching current language:", error)
      }
    }
    fetchData()
  }, []) // 仅在组件挂载时执行一次
  useEffect(() => {
    const fetchData = async () => {
      try {
        await TopStorage.setCurrentLanguage(currentLanguage)
        console.log("current language:", TopStorage.getCurrentLanguage())
      } catch (error) {
        console.error("Error fetching current language:", error)
      }
    }
    fetchData()
  }, [currentLanguage])

  const checkCurrentLanguage = async () => {
      const userLanguage = await TopStorage.getCurrentLanguage()
      setIntl(createIntlObject(userLanguage))
  }
  useEffect(() => {
      checkCurrentLanguage().catch((error) => {
          console.error("An error occurred:", error)
      })
  }, [storage])

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
            id: "general"
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
          marginBottom: "29px",
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
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          flexDirection: "column",
          justifyContent: "center",
          margin: "0 13px 24px"
        }}>
        <div style={{ fontSize: 16, color: "rgba(21.29, 27.63, 26.10, 0.90)" }}>
          {intl.formatMessage({
            id: "current_language_title"
          })}
        </div>
        <div
          style={{
            margin: "3px 0 8px",
            fontSize: 14,
            color: "rgba(21.29, 27.63, 26.10, 0.60)"
          }}>
          {language}
        </div>
        <Select
          value={language}
          style={{ width: "100%" }}
          onChange={handleChange}
          options={languageOptions}
        />
      </div>
    </div>
  )
}
export default GeneralPage
