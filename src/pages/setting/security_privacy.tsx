import {Button, Input, Switch} from "antd"
import GetBackImage from "data-base64:~assets/icons/get_back.png"
import SearchImage from "data-base64:~assets/icons/search_lg.png"
import CloseImage from "data-base64:~assets/icons/x_close.png"
import React, {useEffect, useState} from "react"
import {
    Link,
    Route,
    BrowserRouter as Router,
    Routes,
    useLocation,
    useNavigate
} from "react-router-dom"
import {Storage} from "@plasmohq/storage"
import {createIntlObject} from "~i18n"
import TopStorage from "../../db/user_storage"

function SecurityPrivacyPage() {
    const storage = new Storage({
        area: "local"
    })
    const [intl, setIntl] = useState(() => {
        // 初始化时根据浏览器语言创建 intl 对象
        const userLanguage = navigator.language.toLowerCase()
        return createIntlObject(userLanguage)
    })
    const [currentLanguage, setCurrentLanguage] = useState("")
    const checkCurrentLanguage = async () => {
        const userLanguage = await TopStorage.getCurrentLanguage()
        setIntl(createIntlObject(userLanguage))
    }
    useEffect(() => {
        checkCurrentLanguage().catch((error) => {
            console.error("An error occurred:", error)
        })
    }, [storage])

    const navigate = useNavigate()
    const [metricsIsChecked, setMetricsIsChecked] = useState(false)
    const [privacyIsChecked, setPrivacyIsChecked] = useState(false)
    const titleStyle = {
        fontSize: 16,
        color: "rgba(21.29, 27.63, 26.10, 0.90)",
        marginBottom: "3px"
    }
    const subtitleStyle = {
        fontSize: 14,
        color: "rgba(21.29, 27.63, 26.10, 0.60)"
    }
    const secondTitleStyle = {
        fontSize: 16,
        fontWeight: 700,
        marginBottom: "10px",
        color: "rgba(21.29, 27.63, 26.10, 0.90)"
    }
    const secondSubtitleStyle = {
        fontSize: 18,
        fontWeight: 700,
        marginBottom: "10px",
        color: "rgba(21.29, 27.63, 26.10, 0.60)"
    }
    const handleRevealSRP = () => {
        navigate("/tabs/home.html#reveal_srp")
    }

    const handleAddCustomNetwork = () => {
        navigate("/tabs/home.html#add_network")
    }

    const onChangePrivacyIsChecked = (checked) => {
        setPrivacyIsChecked(checked)
        console.log(`switch to ${checked}`)
    }
    const onChangeMetricsIsChecked = (checked) => {
        setMetricsIsChecked(checked)
        console.log(`switch to ${checked}`)
    }
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
                        id: "security_privacy"
                    })}
                </div>
                <img
                    onClick={() => {
                        navigate(-1)
                    }}
                    src={CloseImage}
                    alt=""
                    style={{width: "20px", height: "20px"}}
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
                    style={{width: "21px", height: "21px"}}
                />
                <input
                    className="custom_input"
                    type="text"
                    placeholder={intl.formatMessage({id: "search"})}
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
                    <div style={titleStyle}>{intl.formatMessage({id: "security"})}</div>
                    <div style={subtitleStyle}>{intl.formatMessage({id: "secret_recovery_phrase"})}</div>
                    <Button
                        type="primary"
                        style={{
                            backgroundColor: "transparent",
                            borderColor: "#3EDFCF",
                            color: "rgba(21.29, 27.63, 26.10, 0.90)",
                            margin: "10px 0 24px",
                            fontSize: 14,
                            padding: "10px 24px",
                            height: "41px"
                        }}
                        onClick={handleRevealSRP}>
                        <div style={subtitleStyle}>{intl.formatMessage({id: "reveal_secret_recovery_phrase"})}</div>
                    </Button>
                </div>
                <div style={secondTitleStyle}>{intl.formatMessage({id: "privacy"})}</div>
                <div style={secondSubtitleStyle}>{intl.formatMessage({id: "transactions"})}</div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "24px"
                    }}>
                    <div>
                        <div style={titleStyle}>{intl.formatMessage({id: "show_balance_and_token_price_checker"})}</div>
                        <div style={subtitleStyle}>
                            {intl.formatMessage({id: "price_checker_word"})}
                        </div>
                    </div>
                    <Switch
                        checked={privacyIsChecked}
                        onChange={onChangePrivacyIsChecked}
                        style={{
                            backgroundColor: privacyIsChecked ? "#38dac4" : "#e0e0dc",
                            marginTop: "3px",
                            height: "22px"
                        }}
                    />
                </div>
                <div style={secondSubtitleStyle}>{intl.formatMessage({id: "network_provider"})}</div>
                <div>
                    <div style={titleStyle}>{intl.formatMessage({id: "choose_your_network"})}</div>
                    <div style={subtitleStyle}>{intl.formatMessage({id: "choose_your_network_word"})}</div>
                    <Button
                        type="primary"
                        style={{
                            backgroundColor: "transparent",
                            borderColor: "#3EDFCF",
                            color: "rgba(21.29, 27.63, 26.10, 0.90)",
                            margin: "10px 0 24px",
                            fontSize: 14,
                            padding: "10px 24px",
                            height: "41px"
                        }}
                        onClick={handleAddCustomNetwork}>
                        {intl.formatMessage({id: "add_custom_network"})}
                    </Button>
                </div>
                <div style={secondSubtitleStyle}>{intl.formatMessage({id: "metrics"})}</div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "24px"
                    }}>
                    <div>
                        <div style={titleStyle}>{intl.formatMessage({id: "participate_in_utility_metrics"})}</div>
                        <div style={subtitleStyle}>
                            {intl.formatMessage({id: "participate_word"})}
                        </div>
                    </div>
                    <Switch
                        checked={metricsIsChecked}
                        onChange={onChangeMetricsIsChecked}
                        style={{
                            backgroundColor: metricsIsChecked ? "#38dac4" : "#e0e0dc",
                            marginTop: "3px",
                            height: "22px"
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default SecurityPrivacyPage
