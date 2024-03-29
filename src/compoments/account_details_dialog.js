import arrowBack from "data-base64:~assets/icons/arrow_back.png"
import PrimaryCopyIcon from "data-base64:~assets/icons/primary_copy.png"
import RedWarningIcon from "data-base64:~assets/icons/red_warning.png"
// import AccountNameEditIcon from "data-base64:~assets/icons/account_name_edit.png";
import WhiteCopyIcon from "data-base64:~assets/icons/white_copy.png"
import xClose from "data-base64:~assets/icons/x_close.png"
import QRCode from "qrcode.react"
import React, { useEffect, useState } from "react"

import TopStorage from "~db/user_storage"
import { createIntlObject } from "~i18n"
import { CustomAlert } from "~utils/hint"
import IdenticonAvatar from "~utils/identiconAvatar"

import LongPressComponent from "~compoments/long_press"

const AccountDetailsDialog = ({ _onClose }) => {
  const [intl, setIntl] = useState(() => {
    // 初始化时根据浏览器语言创建 intl 对象
    const userLanguage = navigator.language.toLowerCase()

    return createIntlObject(userLanguage)
  })

  const checkCurrentLanguage = async () => {
    const currentLanguage = await TopStorage.getCurrentLanguage()
    setIntl(createIntlObject(currentLanguage))
  }

  useEffect(() => {
    // 在组件挂载后检查当前语言
    checkCurrentLanguage().catch((error) => {
      console.error("An error occurred:", error)
    })
  }, [])

  const [currentAddress, setCurrentAddress] = useState(
    "0x010101011010101001010101101010100101010110101010"
  )
  const truncatedValue =
    currentAddress.length > 13
      ? `${currentAddress.substring(0, 7)}...${currentAddress.slice(-5)}`
      : currentAddress
  const [currentPage, setCurrentPage] = useState(1)
  const [alertType, setAlertType] = useState("") //提示的类型
  const [showCustomAlert, setShowCustomAlert] = useState(false) //是否显示提示
  const [customAlertMessage, setCustomAlertMessage] = useState("") //提示文字内容
  const [showPrivateKey, setShowPrivateKey] = useState(false) //是否显示私钥
  const [privateKey, setPrivateKey] = useState("") //私钥

  const handleBack = () => {
    // 后退操作，跳转到上一页
    setCurrentPage(1)
  }

  const handleForward = () => {
    // 前进操作，跳转到下一页
    setCurrentPage((prevPage) => Math.max(prevPage + 1, 1))
  }

  const handleClose = () => {
    currentPage === 3 ? setCurrentPage(2) : _onClose()
  }

  const handleDialogClick = (event) => {
    // 阻止事件冒泡，防止链接的点击事件触发
    event.preventDefault()
    event.stopPropagation()
  }

  useEffect(() => {
    const checkCurrentAddress = async () => {
      const myAddress = await TopStorage.getMyAddress()
      if (myAddress !== undefined) {
        setCurrentAddress(myAddress)
      }
    }
    checkCurrentAddress()
  }, [])

  const copyText = (textToCopy) => {
    // 复制account id
    const input = document.createElement("input")
    input.setAttribute("readonly", "readonly")
    input.setAttribute("value", textToCopy)
    document.body.appendChild(input)
    input.select()
    input.setSelectionRange(0, 9999)
    if (document.execCommand("copy")) {
      document.execCommand("copy")
      setAlertType("success")
      setShowCustomAlert(true)
      setCustomAlertMessage(
        intl.formatMessage({
          id: "copy_success"
        })
      )
      setTimeout(() => {
        // 这里是要执行的代码块
        setShowCustomAlert(false)
      }, 2000)
    }
    document.body.removeChild(input)
  }

  const handleSubmit = async (event) => {
    // 提交密码
    event.preventDefault()
    event.stopPropagation()

    const inputPassword = document.getElementById("inputPassword").value
    const createPassword = await TopStorage.getCreatePassword()
    console.log("Submitted password:", inputPassword)

    if (inputPassword === createPassword) {
      handleForward()
    } else {
      setAlertType("fail")
      setShowCustomAlert(true)
      setCustomAlertMessage(
        intl.formatMessage({
          id: "password_wrong"
        })
      )
      setTimeout(() => {
        // 这里是要执行的代码块
        setShowCustomAlert(false)
      }, 1000)
    }
    // 在这里可以继续处理密码
  }

  const handleShowPrivateKey = async () => {
    // 显示私钥
    setShowPrivateKey(true)
    const _privateKey = await TopStorage.getPrivateKey()
    setPrivateKey(_privateKey)
    handleClose()
  }

  // 页面组件
  const Page1 = () => (
    <div className="flex_center_center_column">
      <IdenticonAvatar address={currentAddress} size={45}></IdenticonAvatar>
      <div
        className="text_black_14_600 flex_center_center"
        style={{ position: "relative", marginTop: "5px" }}>
        Account 1
        {/*<img src={AccountNameEditIcon} style={{ width: "16px", height: "16px", position: "absolute", left: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)"}} alt={"AccountNameEditIcon"}/>*/}
      </div>
      <div
        className="border-12-primary padding-all-20"
        style={{ marginTop: "15px" }}>
        <QRCode
          value={currentAddress}
          style={{ width: "150px", height: "150px" }}
        />
      </div>
      <div
        className="flex_center_center address-container text_white_12_400"
        style={{ marginTop: "15px", maxWidth: "215px" }}>
        <div style={{ width: "85%", overflowWrap: "break-word" }}>
          {currentAddress}
        </div>
        <img
          src={WhiteCopyIcon}
          style={{
            width: "12px",
            height: "12px",
            marginLeft: "6px",
            cursor: "pointer"
          }}
          alt={"WhiteCopyIcon"}
          onClick={() => copyText(currentAddress)}
        />
      </div>
      <div
        className="border-6-primary flex_center_center text_black_14_400"
        style={{
          padding: "12px 24px",
          marginTop: "15px",
          marginBottom: "5px",
          cursor: "pointer"
        }}
        onClick={handleForward}>
        {intl.formatMessage({ id: "show_private_key" })}
      </div>
    </div>
  )

  const Page2 = () => (
    <div className="flex_center_center_column">
      <IdenticonAvatar address={currentAddress} size={45}></IdenticonAvatar>
      <div
        className="text_black_14_600 flex_center_center"
        style={{ position: "relative", marginTop: "5px" }}>
        Account 1
        {/*<img src={AccountNameEditIcon} style={{ width: "16px", height: "16px", position: "absolute", left: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)"}} alt={"AccountNameEditIcon"}/>*/}
      </div>
      <div
        className="flex_center_center address-container text_white_12_400"
        style={{ marginTop: "15px", maxWidth: "150px" }}>
        <div
          style={{
            width: "90%",
            maxWidth: "135px",
            overflowWrap: "break-word"
          }}>
          {truncatedValue}
        </div>
        <img
          src={WhiteCopyIcon}
          style={{
            width: "9px",
            height: "9px",
            marginLeft: "6px",
            cursor: "pointer"
          }}
          alt={"WhiteCopyIcon"}
          onClick={() => copyText(currentAddress)}
        />
      </div>
      {showPrivateKey ? (
        <div
          className="text_black_14_400"
          style={{ marginTop: "15px", width: "100%", textAlign: "start" }}>
          {intl.formatMessage(
            { id: "private_key_of_account" },
            { account: "Account1" }
          )}
        </div>
      ) : (
        <div
          className="text_black_14_400"
          style={{ marginTop: "15px", width: "100%", textAlign: "start" }}>
          {intl.formatMessage({ id: "input_password" })}
        </div>
      )}
      {showPrivateKey ? (
        <div
          className="flex_center_center input-container text_black_14_400"
          style={{ marginTop: "15px", width: "90%", maxWidth: "245px" }}>
          <div style={{ width: "85%", overflowWrap: "break-word" }}>
            {privateKey}
          </div>
          <img
            src={PrimaryCopyIcon}
            style={{
              width: "12px",
              height: "12px",
              marginLeft: "18px",
              cursor: "pointer"
            }}
            alt={"PrimaryCopyIcon"}
            onClick={() => copyText(privateKey)}
          />
        </div>
      ) : (
        <input
          id="inputPassword"
          className="input-container flex_start_center_column text_151c1a66_14_500"
          style={{
            marginTop: "10px",
            height: "30px",
            width: "90%",
            border: "none"
          }}
          placeholder={intl.formatMessage({ id: "password" })}
          type="password"
        />
      )}

      <div
        className="flex_start_center warning_container text_black_13_400"
        style={{ marginTop: "10px", width: "90%", maxWidth: "245px" }}>
        <img
          src={RedWarningIcon}
          style={{
            width: "20px",
            height: "17px",
            marginLeft: "6px",
            marginRight: "8px"
          }}
          alt={"RedWarningIcon"}
        />
        <div
          style={{
            width: "85%",
            maxWidth: "225px",
            overflowWrap: "break-word"
          }}>
          {intl.formatMessage({ id: "input_password_warning" })}
        </div>
      </div>
      {showPrivateKey ? (
        <div
          className="border-6-primary flex_center_center text_black_14_400"
          style={{
            padding: "12px 24px",
            marginTop: "15px",
            marginBottom: "5px",
            cursor: "pointer"
          }}
          onClick={handleClose}>
          {intl.formatMessage({ id: "done" })}
        </div>
      ) : (
        <div
          className={"flex_center_between"}
          style={{ marginTop: "10px", width: "90%", maxWidth: "245" }}>
          <div
            className="border-6-primary flex_center_center text_black_14_400"
            style={{
              padding: "12px 24px",
              marginTop: "15px",
              marginBottom: "5px",
              cursor: "pointer"
            }}
            onClick={handleClose}>
            {intl.formatMessage({ id: "cancel" })}
          </div>
          <div
            className="border-6-primary flex_center_center text_black_14_400"
            style={{
              padding: "12px 24px",
              marginTop: "15px",
              marginBottom: "5px",
              cursor: "pointer"
            }}
            onClick={handleSubmit}>
            {intl.formatMessage({ id: "confirm" })}
          </div>
        </div>
      )}
    </div>
  )

  const Page3 = () => (
    <div className="flex_center_center_column">
      <div
        className="flex_start_center_column"
        style={{ marginTop: "20px", width: "90%", maxWidth: "245px" }}>
        <div>
          <span className="text_black_14_400">
            {intl.formatMessage({ id: "protect_key_warning_1" })}
          </span>
          <span className="text_black_14_600">
            {intl.formatMessage({ id: "protect_key_warning_2" })}
          </span>
        </div>
        <div style={{ marginTop: "10px" }}>
          <span className="text_black_14_600">
            {intl.formatMessage({ id: "protect_key_warning_3" })}
          </span>
          <span className="text_black_14_400">
            {intl.formatMessage({ id: "protect_key_warning_4" })}
          </span>
        </div>
        <div>
          <span className="text_red_14_600">
            {intl.formatMessage({ id: "protect_key_warning_5" })}
          </span>
        </div>
      </div>
      <LongPressComponent onLongPress={handleShowPrivateKey}>
        <div
          className="border-6-primary flex_center_center text_black_14_400"
          style={{
            padding: "12px 24px",
            marginTop: "25px",
            marginBottom: "5px",
            cursor: "pointer"
          }}>
          {intl.formatMessage({ id: "long_press_to_show_private_key" })}
        </div>
      </LongPressComponent>
    </div>
  )

  return (
    <div className="dialog" onClick={(event) => handleDialogClick(event)}>
      <div className="flex_center_between">
        {currentPage === 2 ? (
          <img
            src={arrowBack}
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
            onClick={handleBack}
            alt={"Back"}
          />
        ) : (
          <div style={{ width: "20px", height: "20px" }} />
        )}
        {currentPage === 2 ? (
          <div className="text_black_14_600">
            {intl.formatMessage({ id: "show_private_key" })}
          </div>
        ) : null}
        {currentPage === 3 ? (
          <div className="text_black_16_600">
            {intl.formatMessage({ id: "protect_your_private_key" })}
          </div>
        ) : null}
        <img
          src={xClose}
          style={{ width: "20px", height: "20px", cursor: "pointer" }}
          onClick={handleClose}
          alt={"Close"}
        />
      </div>
      <div>
        {/* 根据当前页面渲染不同的内容 */}
        {showCustomAlert && (
          <CustomAlert
            message={customAlertMessage}
            type={alertType}
            onclick={() => {}}
          />
        )}
        {currentPage === 1 && <Page1 />}
        {currentPage === 2 && <Page2 />}
        {currentPage === 3 && <Page3 />}
      </div>
    </div>
  )
}

export default AccountDetailsDialog
