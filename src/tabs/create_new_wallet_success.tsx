import createWalletPoint from "data-base64:~assets/icons/create_wallet_point.png"
import createWalletSuccess from "data-base64:~assets/images/create_wallet_success.png"
import React, { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import WelcomeHeader from "~compoments/welcome_header"

import { createIntlObject } from "../i18n"
import TopStorage from "~db/user_storage";

function CreateWalletSuccess() {
  const storage = new Storage({
    area: "local"
  })
  const mouseOver = (e) => {
    e.target.style.background = "#3EDFCF"
  }
  const mouseOut = (e) => {
    e.target.style.background = "white"
  }
  const toNext = () => {
    chrome.tabs.update({ url: "tabs/guide_pages.html" })
  }
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
  }, [storage])

  document.title = "Complete1" //浏览器标题
  return (
    <div>
      <WelcomeHeader />
      <div className="flex_center_center_column" style={{ width: "100%" }}>
        <div
          //   className="flex_center_center_column"
          style={{
            width: "40%",
            padding: "55px 55px 30px",
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
          <img
            src={createWalletSuccess}
            alt=""
            style={{
              width: "200px",
              height: "174px",
              marginBottom: "19px",
              margin: "auto"
            }}
          />
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              textAlign: "center",
              padding: "0 5%"
            }}>
            {intl.formatMessage({
              id: "creact_wallet_success"
            })}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 400,
              textAlign: "center",
              padding: "12px 0 5px"
            }}>
            {intl.formatMessage({
              id: "creact_wallet_success_tip"
            })}
          </div>
          <div
            style={{
              color: "rgba(21.29, 27.63, 26.10, 0.90)",
              fontSize: 15,
              fontWeight: 500,
              wordWrap: "break-word",
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              marginTop: "15px",
              paddingLeft: "88px"
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
                id: "creact_wallet_success_illustrate1"
              })}
            </div>
          </div>
          <div
            style={{
              color: "rgba(21.29, 27.63, 26.10, 0.90)",
              fontSize: 15,
              fontWeight: 500,
              wordWrap: "break-word",
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              marginTop: "15px",
              paddingLeft: "88px"
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
                id: "creact_wallet_success_illustrate2"
              })}
            </div>
          </div>
          <div
            style={{
              color: "rgba(21.29, 27.63, 26.10, 0.90)",
              fontSize: 15,
              fontWeight: 500,
              wordWrap: "break-word",
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              marginTop: "15px",
              paddingLeft: "88px"
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
                id: "creact_wallet_success_illustrate3"
              })}
            </div>
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
          {intl.formatMessage({
            id: "got_it"
          })}
        </div>
      </div>
    </div>
  )
}
export default CreateWalletSuccess
