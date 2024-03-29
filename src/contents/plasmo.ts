import type { PlasmoCSConfig } from "plasmo"

import TopStorage from "~db/user_storage"

// 全局声明，指定 window 对象中的 utility 属性
declare global {
  interface Window {
    utility: any // 或者根据您的需求更精确地指定类型
  }
}

// 创建 utility 对象
const utility = {
  send: async function (action: string) {
    // 实现逻辑
    console.log("发送请求：" + action)
  }
}

// 将 utility 对象注入到 window 对象中
window.utility = utility

// 导出 PlasmoCSConfig 对象
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_end"
}

// 发送消息给后台脚本
// chrome.runtime.sendMessage(
//   { type: "getCurrentUrl" },
//   async function (response) {
//     const currentUrl = response.url
//     console.log("currentUrl:", currentUrl) // 在控制台中显示当前页面的URL
//   }
// )

// chrome.runtime.sendMessage(
//   { type: "sendToMyWallet" },
//   async function (response) {
//     console.log("response:", response)
//   }
// )
