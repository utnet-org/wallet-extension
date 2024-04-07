import { Button, Input, Switch } from "antd"
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

import DownloadButton from "~compoments/DownloadButton"
import TopStorage from "~db/user_storage"
import { createIntlObject } from "~i18n"

function AdvancedPage() {
  const [intl, setIntl] = useState(() => {
    // 初始化时根据浏览器语言创建 intl 对象
    const userLanguage = navigator.language.toLowerCase()
    return createIntlObject(userLanguage)
  })
  const [lockTime, setLockTimeValue] = useState("0")
  const navigate = useNavigate()
  const [isChecked, setIsChecked] = useState(false)
  const titleStyle = {
    fontSize: 16,
    color: "rgba(21.29, 27.63, 26.10, 0.90)",
    marginBottom: "3px"
  }
  const subtitleStyle = {
    fontSize: 14,
    color: "rgba(21.29, 27.63, 26.10, 0.60)"
  }
  const onChange = (checked) => {
    setIsChecked(!isChecked)
    console.log(`switch to ${checked}`)
  }
  const [backupList, setBackupList] = useState([]) // 备份列表
  const checkCurrentLanguage = async () => {
    const userLanguage = await TopStorage.getCurrentLanguage()
    setIntl(createIntlObject(userLanguage))
    const stroageLockTime = await TopStorage.getLockTimeMinute()
    if (
      stroageLockTime === undefined ||
      stroageLockTime === null ||
      stroageLockTime === "" ||
      stroageLockTime === "0"
    ) {
      setLockTimeValue("0")
    } else {
      setLockTimeValue(stroageLockTime)
    }
    setBackupList([
      {
        chainId: await TopStorage.getChainId(),
        address: await TopStorage.getMyAddress(),
        activityList: await TopStorage.getActivityList()
      }
    ])
  }
  const changeLockTime = async () => {
    console.log("setLockTime", lockTime)
    if (Number(lockTime) < 0) {
      return
    }
    const nowTime = new Date().getTime()
    const newLockTime = nowTime + Number(lockTime) * 60 * 1000
    console.log("newLockTime", newLockTime)
    await TopStorage.setLockTime(newLockTime)
    await TopStorage.setLockTimeMinute(lockTime)
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
          minHeight: "63px",
          maxHeight: "63px",
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
            id: "advanced"
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
          width: "100%",
          padding: "0 13px",
          boxSizing: "border-box"
        }}>
        <div>
          <div style={titleStyle}>
            {intl.formatMessage({
              id: "state_logs"
            })}
          </div>
          <div style={subtitleStyle}>
            {intl.formatMessage({
              id: "state_logs_tip"
            })}
          </div>
          <DownloadButton
            type="download"
            data={backupList}
            title={intl.formatMessage({
              id: "download_state_logs"
            })}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "24px"
          }}>
          <div>
            <div style={titleStyle}>
              {intl.formatMessage({
                id: "show_hex_data"
              })}
            </div>
            <div style={subtitleStyle}>
              {intl.formatMessage({
                id: "show_hex_data_tip"
              })}
            </div>
          </div>
          <Switch
            disabled={true}
            checked={isChecked}
            onChange={onChange}
            style={{
              backgroundColor: isChecked ? "#38dac4" : "#e0e0dc",
              marginTop: "3px",
              height: "22px"
            }}
          />
        </div>
        <div>
          <div style={titleStyle}>
            {intl.formatMessage({
              id: "auto_lock_timer_minutes"
            })}
          </div>
          <div style={subtitleStyle}>
            {intl.formatMessage({
              id: "auto_lock_timer_minutes_tip"
            })}
          </div>
          <Input
            type="number"
            placeholder="0"
            variant="filled"
            style={{ height: "39px", marginTop: "10px" }}
            value={lockTime}
            onChange={(e) => setLockTimeValue(e.target.value)}
          />
          <Button
            onClick={changeLockTime}
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
            {intl.formatMessage({
              id: "save"
            })}
          </Button>
        </div>
        <div>
          <div style={titleStyle}>
            {intl.formatMessage({
              id: "backup_your_data"
            })}
          </div>
          <div style={subtitleStyle}>
            {intl.formatMessage({
              id: "backup_your_data_tip"
            })}
          </div>
          <DownloadButton
            type="download"
            data={backupList}
            title={intl.formatMessage({
              id: "backup"
            })}
          />
        </div>
        <div>
          <div style={titleStyle}>
            {intl.formatMessage({
              id: "restore_user_data"
            })}
          </div>
          <div style={subtitleStyle}>
            {intl.formatMessage({
              id: "restore_user_data_tip"
            })}
          </div>
          <DownloadButton
            type="restore"
            title={intl.formatMessage({
              id: "restore"
            })}
          />
        </div>
      </div>
    </div>
  )
}
export default AdvancedPage
