import { Button } from "antd"
import { saveAs } from "file-saver"
import * as React from "react"

import TopStorage from "~db/user_storage"

interface DownloadButtonProps {
  type?: string
  data?: Record<string, any>
  title: string
}
const DownloadButton: React.FC<DownloadButtonProps> = ({
  data,
  title,
  type
}) => {
  const handleButtonClick = async () => {
    // 下载数据
    if (type === "download") {
      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json"
      })
      saveAs(blob, "Utility-backup.json")
    }
    // 恢复数据
    if (type === "restore") {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = ".json" // 可选择的文件类型
      input.onchange = async (event) => {
        const target = event.target as HTMLInputElement
        const file = target.files?.[0]
        if (file) {
          const fileReader = new FileReader()

          fileReader.onload = async (e) => {
            if (e.target?.result) {
              const fileContent = e.target.result.toString()
              console.log("File content:", fileContent) // 打印文件内容
              const fileObject = JSON.parse(fileContent)
              if (
                fileObject.address &&
                fileObject.address == (await TopStorage.getMyAddress())
              ) {
                await TopStorage.setChainId(fileObject.chainId)
                await TopStorage.setActivityList(fileObject.activityList)
              }
            }
          }
          ;[
            {
              accountId:
                "9fef0846339cb73d042690ee15199912a443e2cfa8d39eac5220230716c26010",
              chainId: "1",

              activatis: []
            }
          ]

          fileReader.readAsText(file)
        }
      }
      input.click()
    }
  }

  return (
    <Button
      onClick={handleButtonClick} // 添加 onClick 属性来触发下载
      type="primary"
      style={{
        backgroundColor: "transparent",
        borderColor: "#3EDFCF",
        color: "rgba(21.29, 27.63, 26.10, 0.90)",
        margin: "10px 0 24px",
        fontSize: 14,
        padding: "10px 24px",
        height: "41px"
      }}>
      {title}
    </Button>
  )
}

export default DownloadButton
