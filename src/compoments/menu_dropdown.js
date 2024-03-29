import React, { useEffect, useRef, useState } from "react"
import "../style.css"
import menuImg from "data-base64:~assets/icons/home_menu.png"
import { Storage } from "@plasmohq/storage"
import TopStorage from "~db/user_storage";
import { createIntlObject } from "../i18n"

const Dropdown = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const storage = new Storage({
    area: "local"
  })

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
  }, [storage])

  const handleOptionClick = (option) => {
    setIsOpen(false)
    option.handleClick()
  }

  const closeDropdown = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("click", closeDropdown)
    return () => {
      document.removeEventListener("click", closeDropdown)
    }
  }, [])

  return (
    <div className="dropdown" ref={dropdownRef}>
      <img
        src={menuImg}
        style={{ width: "24px", height: "24px" }}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <ul className="menu-dropdown-menu">
          {options.map((option, index) => (
            <div
              className={`${index === 0 ? "menu-dropdown-menu-first" : ""}`}
              key={option.value}
              to={option.value}
              style={{ textDecoration: "none" }}>
              <li
                className="text_black_13_400"
                key={option.value}
                onClick={() => handleOptionClick(option)}>
                {option.icon && (
                  <img
                    src={option.icon}
                    alt={option.label}
                    style={{
                      marginRight: "8px",
                      width: "20px",
                      height: "20px"
                    }}
                  />
                )}
                {intl.formatMessage({ id: option.label })}
              </li>
            </div>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Dropdown
