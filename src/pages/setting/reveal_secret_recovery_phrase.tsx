import React, {useEffect, useState} from "react"
import TopStorage from "~db/user_storage"
import {createIntlObject} from "~i18n"
import RedWarningIcon from "data-base64:~assets/icons/red_warning.png"
import CloseImage from "data-base64:~assets/icons/x_close.png"
import {useNavigate} from "react-router-dom"
import xClose from "data-base64:~assets/icons/x_close.png"
import LongPressComponent from "~compoments/long_press";
import {CustomAlert} from "~utils/hint"

const RevealSecretRecoveryPhrase = () => {
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

    const navigate = useNavigate()
    const [showSRP, setShowSRP] = useState(false) //是否显示私钥助记词
    const [showConfirmDialog, setShowConfirmDialog] = useState(false) //是否显示确认弹窗
    const [alertType, setAlertType] = useState("") //提示的类型
    const [showCustomAlert, setShowCustomAlert] = useState(false) //是否显示提示
    const [customAlertMessage, setCustomAlertMessage] = useState("") //提示文字内容
    const [SRP, setSRP] = useState("") //获取助记词
    const [SRPList, setSRPList] = useState([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""]) //助记词List

    const handleClose = async () => {
        navigate(-1)
    }

    const handleSubmit = async (event) => {
        // 提交密码
        event.preventDefault()
        event.stopPropagation()

        const inputPassword = (document.getElementById("inputPassword") as HTMLInputElement).value
        const createPassword = await TopStorage.getCreatePassword()
        console.log("Submitted password:", inputPassword)

        if (inputPassword === createPassword) {
            setShowConfirmDialog(true);
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

    const handleDialogClick = (event) => {
        // 阻止事件冒泡，防止链接的点击事件触发
        event.preventDefault()
        event.stopPropagation()
    }

    const handleDialogClose = () => {
        setShowConfirmDialog(false)
    }

    const handleShowSRP = async () => {
        setShowSRP(true);
        const mySRP = await TopStorage.getMnemonicPhrase()
        setSRP(mySRP);
        setSRPList(mySRP.split(" "))
        handleDialogClose();
    }

    const confirmDialog = () => {
        return (
            <div className="dialog" onClick={(event) => handleDialogClick(event)}>
                <div className="flex_center_between">
                    <div></div>
                    <div className="text_black_16_600">
                        {intl.formatMessage({id: "protect_your_SRP"})}
                    </div>
                    <img
                        src={xClose}
                        style={{width: "20px", height: "20px", cursor: "pointer"}}
                        onClick={handleDialogClose}
                        alt={"Close"}
                    />
                </div>
                <div
                    className="flex_start_center_column"
                    style={{marginTop: "20px", width: "90%", maxWidth: "250px"}}>
                    <div>
                        <span className="text_black_14_400">
                            {intl.formatMessage({id: "protect_your_SRP_word_1"})}
                        </span>
                        <span className="text_black_14_600">
                            {intl.formatMessage({id: "protect_your_SRP_word_2"})}
                        </span>
                    </div>
                    <div style={{marginTop: "10px"}}>
                        <span className="text_black_14_600">
                            {intl.formatMessage({id: "protect_your_SRP_word_3"})}
                        </span>
                        <span className="text_black_14_400">
                            {intl.formatMessage({id: "protect_your_SRP_word_4"})}
                        </span>
                    </div>
                    <div>
                        <span className="text_red_14_600">
                            {intl.formatMessage({id: "protect_your_SRP_word_5"})}
                        </span>
                    </div>
                </div>
                <div className="flex_center_center">
                    <LongPressComponent onLongPress={handleShowSRP}>
                        <div
                            className="border-6-primary flex_center_center text_black_14_400"
                            style={{
                                padding: "12px 24px",
                                marginTop: "25px",
                                marginBottom: "5px",
                                cursor: "pointer"
                            }}>
                            {intl.formatMessage({id: "press_to_show_SRP"})}
                        </div>
                    </LongPressComponent>
                </div>
            </div>
        )
    }

    const copySRP = () => {
        const input = document.createElement("input")
        input.setAttribute("readonly", "readonly")
        input.setAttribute("value", SRP)
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

    const SRPGrid = () => {
        return (
            <div className={"flex_center_center"}
                 style={{marginTop: "10px"}}>
                <div
                    style={{
                        width: "95%",
                        maxWidth: "320px",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        borderRadius: 10,
                        border: "1px rgba(205, 206, 206, 0.30) solid",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                        gridGap: "10px",
                        boxSizing: "border-box"
                    }}>
                    {SRPList.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                width: "80px",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "end",
                                fontSize: 12,
                                fontWeight: 600,
                                color: "rgba(21.29, 27.63, 26.10, 0.90)"
                            }}>
                            {index + 1}.
                            <input
                                type="text"
                                value={item}
                                style={{
                                    maxWidth: "50px",
                                    padding: "6px 6px",
                                    width: "max-content",
                                    fontSize: 12,
                                    borderRadius: 6,
                                    textAlign: "center",
                                    border: "1px #ecece8 solid",
                                    marginLeft: "3px"
                                }}
                            />
                        </div>
                    ))}
                    <div className={"flex_center_center"}
                         style={{width: "100%"}}>
                        <div
                            className="border-6-primary flex_center_center text_black_14_400"
                            style={{
                                padding: "12px 24px",
                                marginTop: "15px",
                                marginBottom: "5px",
                                cursor: "pointer"
                            }}
                            onClick={copySRP}>
                            {intl.formatMessage({id: "copy_to_clipboard"})}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex_start_center_column" style={{marginTop: "20px"}}>
            {showCustomAlert && (
                <CustomAlert
                    message={customAlertMessage}
                    type={alertType}
                    onclick={() => {
                    }}
                />
            )}
            <div className="flex_center_between" style={{width: "100%", maxWidth: "320px"}}>
                <div className="text_black_18_600">{intl.formatMessage({id: "secret_recovery_phrase"})}</div>
                <div>
                    {showSRP ? (
                        <img
                            onClick={handleClose}
                            src={CloseImage}
                            alt=""
                            style={{width: "20px", height: "20px"}}
                        />
                    ) : null}
                </div>
            </div>
            <div className="flex_start_center_column"
                 style={{marginTop: "20px", maxWidth: "320px"}}>
                <div>
                    <span className="text_black_14_400">
                        {intl.formatMessage({id: "reveal_SRP_word_1"})}
                    </span>
                    <span className="text_black_14_600">
                        {intl.formatMessage({id: "reveal_SRP_word_2"})}
                    </span>
                </div>
                <div style={{marginTop: "10px"}}>
                    <span className="text_black_14_400">
                        {intl.formatMessage({id: "reveal_SRP_word_3"})}
                    </span>
                </div>
            </div>
            <div
                className="flex_start_center warning_container"
                style={{marginTop: "20px", width: "90%"}}>
                <img
                    src={RedWarningIcon}
                    style={{
                        width: "20px",
                        height: "17px",
                        marginLeft: "0px",
                        marginRight: "8px"
                    }}
                    alt={"RedWarningIcon"}
                />
                <div
                    style={{
                        width: "90%",
                        maxWidth: "235px",
                        overflowWrap: "break-word"
                    }}>
                    <span className="text_black_13_400">
                        {intl.formatMessage({id: "reveal_SRP_warning_1"})}
                    </span>
                    <span className="text_black_13_500">
                        {intl.formatMessage({id: "reveal_SRP_warning_2"})}
                    </span>
                </div>
            </div>
            {showSRP ? (
                <div
                    className="text_black_14_500"
                    style={{marginTop: "15px"}}>
                    {intl.formatMessage({id: "your_secret_recovery_phrase"},)}
                </div>
            ) : (
                <div
                    className="text_black_14_500"
                    style={{marginTop: "15px"}}>
                    {intl.formatMessage({id: "enter_your_password"})}
                </div>
            )}
            {!showSRP && (
                <input
                    id="inputPassword"
                    className="input-container flex_start_center_column text_151c1a66_14_500"
                    style={{
                        marginTop: "10px",
                        height: "30px",
                        width: "90%",
                        border: "none"
                    }}
                    placeholder={intl.formatMessage({id: "password"})}
                    type="password"
                />
            )}
            {showSRP ? (
                SRPGrid()
                // <div></div>
            ) : (
                <div className={"flex_center_center"}
                     style={{marginTop: "50px", width: "100%"}}>
                    <div className={"flex_center_between"}
                         style={{width: "80%"}}>
                        <div
                            className="border-6-primary flex_center_center text_black_14_400"
                            style={{
                                padding: "12px 24px",
                                marginTop: "15px",
                                marginBottom: "5px",
                                cursor: "pointer"
                            }}
                            onClick={handleClose}>
                            {intl.formatMessage({id: "cancel"})}
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
                            {intl.formatMessage({id: "next_step"})}
                        </div>
                    </div>
                </div>
            )}
            {showConfirmDialog && (
                <div className="overlay" onClick={handleDialogClose}>
                    {confirmDialog()}
                </div>
            )}
        </div>
    )
}

export default RevealSecretRecoveryPhrase
