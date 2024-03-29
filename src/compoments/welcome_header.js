import "../style.css"
import React from "react";
import Dropdown from './language_dropdown';
import logoImg from "data-base64:~assets/icon.png";

const WelcomeHeader = () => {
    const options = [
        { value: 'en', label: 'English' },
        { value: 'zh-cn', label: '简体中文' },
    ];

    return (
        <div className="welcome_header">
            <div className="flex_center_center">
                <img src={logoImg} alt="Utility" style={{ width: "32px", height: "37px", marginRight: "8px" }} />
                <div className="text_black_14_600">Utility</div>
            </div>
            <Dropdown options={options} />
        </div>
    );
};

export default WelcomeHeader;