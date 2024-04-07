import { Button, Input } from "antd"
import iconImage from "data-base64:~assets/icon.png"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import TopStorage from "~db/user_storage"
import { createIntlObject } from "~i18n"

function LockPage() {
  const navigate = useNavigate()
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
    checkCurrentLanguage().catch((error) => {
      console.error("An error occurred:", error)
    })
  }, [])
  return (
    <div
      style={{
        width: 357,
        height: 600,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>
      <div className="home_page">
        <div
          style={{
            width: "160px",
            height: "160px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "80px",
            backgroundColor: "#f4f7f7",
            marginBottom: "22px"
          }}>
          <img
            src={iconImage}
            alt=""
            style={{ width: "80px", height: "95px" }}
          />
        </div>
        <div
          style={{
            width: "313px",
            // margin: "0 22px",
            padding: "30px",
            boxSizing: "border-box",
            borderRadius: "14px",
            background:
              "linear-gradient(180deg, rgba(244, 248, 248, 0.05) 0.13%, rgba(244, 248, 248, 0.00) 99.87%)",
            boxShadow: "0px 1px 1px 1px rgba(223, 231, 230, 0.50) inset",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>Welcome back!</div>
          <div style={{ fontSize: "14px", fontWeight: 400, marginTop: "10px" }}>
            Coming to Utility net
          </div>
          <Input
            placeholder="Password"
            style={{
              width: "100%",
              height: "37px",
              margin: "24px 18px 0 18px",
              boxSizing: "border-box",
              border: "none",
              background: "#f4f7f7"
            }}
          />
          <Button
            onClick={async () => {
              await TopStorage.setLockTime("")
              navigate("/tabs/home.html")
            }}
            type="primary"
            style={{
              backgroundColor: "transparent",
              borderColor: "#3EDFCF",
              color: "rgba(21.29, 27.63, 26.10, 0.90)",
              margin: "28px 0 16px",
              fontSize: 14,
              padding: "10px 42px",
              height: "41px"
            }}>
            Login
          </Button>
          <div
            // onClick={changeLockTime}
            style={{ color: "#3EDFCF", fontSize: "13px", cursor: "pointer" }}>
            Forgot password?
          </div>
        </div>
      </div>
    </div>
  )
}
export default LockPage
