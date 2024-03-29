import React, {useEffect, useState} from "react"
import TopStorage from "~db/user_storage"
import {createIntlObject} from "~i18n"

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

    return (
        <div>RevealSecretRecoveryPhrase</div>
    )
}

export default RevealSecretRecoveryPhrase
