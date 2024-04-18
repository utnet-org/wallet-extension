import { useEffect } from "react"

import "./style.css"

import React from "react"

import TopStorage from "~db/user_storage"

import Home from "./tabs/home"

function IndexPopup() {
  useEffect(() => {
    const checkIsFirst = async () => {
      const isfirst = await TopStorage.hasCreatedWallet()
      if (isfirst === "true") {
        // await storage.set("isfirst", "true")
      } else {
        // await storage.set("isfirst", "false")
        await chrome.tabs.create({ url: "tabs/welcome.html" })
      }
    }
    checkIsFirst() // 添加beforeunload事件监听器
  }, [])

  return (
    <div
      style={{
        width: 357,
        height: 600,
        display: "flex",
        flexDirection: "column"
      }}>
      <Home />
    </div>
  )
}

export default IndexPopup
