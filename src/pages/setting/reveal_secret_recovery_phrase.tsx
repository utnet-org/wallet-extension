import React, {useEffect, useState} from "react"
import TopStorage from "~db/user_storage"
import {createIntlObject} from "~i18n"
import RedWarningIcon from "data-base64:~assets/icons/red_warning.png"
import CloseImage from "data-base64:~assets/icons/x_close.png"
import {useNavigate} from "react-router-dom";

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

    const handleClose = async () => {
        navigate(-1)
    }

    return (
        <div className="flex_start_center_column" style={{marginTop: "20px"}}>
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
            {showSRP ? (
                <div>
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
                    placeholder={intl.formatMessage({id: "password"})}
                    type="password"
                />
            )}
            {showSRP ? (
                <div className={"flex_center_center"}
                     style={{marginTop: "10px", width: "100%"}}>
                    <div
                        className="border-6-primary flex_center_center text_black_14_400"
                        style={{
                            padding: "12px 24px",
                            marginTop: "15px",
                            marginBottom: "5px",
                            cursor: "pointer"
                        }}
                        onClick={() => {
                        }}>
                        {intl.formatMessage({id: "copy_to_clipboard"})}
                    </div>
                </div>
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
                            onClick={() => {
                            }}>
                            {intl.formatMessage({id: "next_step"})}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RevealSecretRecoveryPhrase
