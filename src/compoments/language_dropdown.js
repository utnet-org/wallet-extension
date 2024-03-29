import React, { useEffect, useRef, useState } from "react"

import "../style.css"

import arrowDown from "data-base64:~assets/icons/arrow_down.png"

import { Storage } from "@plasmohq/storage"
import TopStorage from "~db/user_storage";

import translations from "../translations.json"

const Dropdown = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState("")

  const dropdownRef = useRef(null)
  const storage = new Storage({
    area: "local"
  })

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const closeDropdown = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  const handleOptionClick = async (option) => {
    setSelectedOption(option)
    setIsOpen(false)

    // 存储新语言到 storage
    await TopStorage.setCurrentLanguage(option.value)

    // 更新 currentLanguage 状态
    await setCurrentLanguage(option.label)
  }

  const checkCurrentLanguage = async () => {
    let language = await TopStorage.getCurrentLanguage()
    setCurrentLanguage(translations[language]?.current_language)
  }

  useEffect(() => {
    // 在组件挂载后检查当前语言
    checkCurrentLanguage().catch((error) => {
      console.error("An error occurred:", error)
    })
  }, [storage])

  useEffect(() => {
    const handleCurrentLanguageChange = async () => {
      console.log("currentLanguage updated:", currentLanguage)
      // 在这里可以执行其他处理
    }

    handleCurrentLanguageChange()
  }, [currentLanguage])

  useEffect(() => {
    document.addEventListener("click", closeDropdown)
    return () => {
      document.removeEventListener("click", closeDropdown)
    }
  }, [])

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div
        className="dropdown-toggle flex_center_center"
        onClick={toggleDropdown}>
        {selectedOption ? selectedOption.label : currentLanguage}
        <img
          src={arrowDown}
          style={{ width: "14px", height: "14px", marginLeft: "5px" }}
        />
      </div>
      {isOpen && (
        <ul className="dropdown-menu">
          {options.map((option) => (
            <li key={option.value} onClick={() => handleOptionClick(option)}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Dropdown
