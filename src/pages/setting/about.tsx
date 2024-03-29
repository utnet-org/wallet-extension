import { Select } from "antd"
import logoImage from "data-base64:~assets/icon.png"
import GetBackImage from "data-base64:~assets/icons/get_back.png"
// import RedWarningImage from "data-base64:~assets/icons/red_warning.png"
import SearchImage from "data-base64:~assets/icons/search_lg.png"
import CloseImage from "data-base64:~assets/icons/x_close.png"
import LogoBottomImage from "data-base64:~assets/images/logo_bottom.png"
import React, { useState } from "react"
import {
  Link,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom"

function AboutPage() {
  const navigate = useNavigate()
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
          General
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
          placeholder="Search"
          style={{
            border: "none",
            flex: 1,
            marginLeft: "8px",
            backgroundColor: "transparent"
          }}
        />
      </div>
      <div style={{ marginLeft: "13px" }}>
        <div
          style={{
            marginBottom: "3px",
            fontSize: 16,
            color: "rgba(21.29, 27.63, 26.10, 0.90)"
          }}>
          Utility Version
        </div>
        <div
          style={{
            marginBottom: "24px",
            fontSize: 14,
            color: "rgba(21.29, 27.63, 26.10, 0.60)"
          }}>
          1.0.0
        </div>
        <div
          style={{
            marginBottom: "6px",
            fontSize: 16,
            color: "rgba(21.29, 27.63, 26.10, 0.90)"
          }}>
          Links
        </div>
        <div style={{ marginBottom: "6px", fontSize: 16, color: "#3EDFCF" }}>
          Privacy policy
        </div>
        <div style={{ fontSize: 16, color: "#3EDFCF" }}>Terms of use</div>
        <div
          style={{
            width: "106px",
            border: "1px solid rgba(21.29, 27.63, 26.10, 0.10)",
            margin: "14px 0"
          }}></div>
        <div style={{ fontSize: 16, color: "#3EDFCF" }}>Contact us</div>
      </div>
      <div
        style={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}>
        <img
          src={logoImage}
          alt=""
          style={{
            width: "84px",
            height: "98px",
            position: "absolute",
            bottom: "50px"
          }}
        />
        <img
          src={LogoBottomImage}
          alt=""
          style={{
            width: "180px",
            height: "80px",
            position: "absolute",
            bottom: "10px"
          }}
        />
      </div>
    </div>
  )
}
export default AboutPage
