import checkIcon from "data-base64:~assets/icons/check_square.png"
import uncheckIcon from "data-base64:~assets/icons/uncheck_square.png"
import warnImage from "data-base64:~assets/icons/warn.png"
import React, { useEffect, useState } from "react"

import TopStorage from "~db/user_storage";

import { createIntlObject } from "~i18n"

function CustomAlert({ message, type, onclick }) {
  return (
    <div
      onClick={onclick}
      className="flex_center_center"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: "0",
        left: "0",
        zIndex: "9999"
      }}>
      <div
        className="flex_center_center"
        style={{
          // width: "20%",
          padding: "0px 20px",
          background: "#fff",
          border: `1px solid ${type === "success" ? "#3EDFCF" : "#F14B4B"}`,
          borderRadius: "5px",
          fontSize: "14px",
          textAlign: "center"
        }}>
        <p style={{ color: `${type === "success" ? "#3EDFCF" : "#F14B4B"}` }}>
          {message}
        </p>
      </div>
    </div>
  )
}
function MaskAlert({
  message,
  type,
  protocol,
  isChecked,
  onclick,
  clickBack,
  clickSkip,
  handleCheckClick
}) {
  const backMouseOver = (e) => {
    e.target.style.background = "#3EDFCF"
  }
  const backMouseOut = (e) => {
    e.target.style.background = "white"
  }
  const skipMouseOver = (e) => {
    e.target.style.background = "#3EDFCF"
  }
  const skipMouseOut = (e) => {
    e.target.style.background = "white"
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
  }, [])

  return (
    <div
      onClick={onclick}
      className="flex_center_center"
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(21.29, 27.63, 26.10, 0.20)",
        position: "absolute",
        top: "0",
        left: "0",
        zIndex: "999"
      }}>
      <div
        className="flex_center_center_column"
        style={{
          width: "477px",
          padding: "1.5%",
          boxSizing: "border-box",
          background: "#FFFEFB",
          borderRadius: "22px",
          border: "1px rgba(21.29, 27.63, 26.10, 0.12) solid"
        }}>
        <img
          src={warnImage}
          alt=""
          style={{ width: "160px", height: "143px" }}
        />
        <div
          style={{
            color: "rgba(21.29, 27.63, 26.10, 0.90)",
            fontSize: 26,
            fontWeight: 600,
            margin: "22px 0 13px"
          }}>
          {message}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center"
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
          <div style={{ fontSize: 14, marginLeft: "8px" }}>{protocol}</div>
        </div>
        <div
          style={{
            // width: "40%",
            paddingTop: "27px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-evenly"
          }}>
          <div
            onMouseOver={backMouseOver}
            onMouseOut={backMouseOut}
            onClick={clickBack}
            style={{
              padding: "10px 30px",
              borderRadius: 6,
              border: "1px #3EDFCF solid",
              textAlign: "center",
              color: "rgba(21.29, 27.63, 26.10, 0.90)",
              fontSize: 14,
              fontFamily: "Inter",
              fontWeight: "500",
              wordWrap: "break-word",
              cursor: "pointer",
              marginRight: "28px"
            }}>
            {intl.formatMessage({ id: "back" })}
          </div>
          <div
            onMouseOver={skipMouseOver}
            onMouseOut={skipMouseOut}
            onClick={() => clickSkip(isChecked)}
            style={{
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
            {intl.formatMessage({ id: "skip" })}
          </div>
        </div>
      </div>
    </div>
  )
}
export { CustomAlert, MaskAlert }
