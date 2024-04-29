import iconImage from "data-base64:~assets/icon.png"
import ToBottomWhite from "data-base64:~assets/icons/to_bottom_white.png"
import React, { useState } from "react"

function ChainListPage() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <div
        onClick={() => {}}
        className="flex_center_center"
        style={{
          padding: "0 10px",
          height: "30px",
          borderRadius: "15px",
          backgroundColor: "#3EDFCF",
          cursor: "pointer"
        }}>
        <div
          style={{
            width: "16px",
            height: "16px",
            lineHeight: "16px",
            textAlign: "center",
            fontSize: "10px",
            fontWeight: "600",
            backgroundColor: "white",
            borderRadius: "50%"
          }}>
          {false && <div>E</div>}
          {true && (
            <img src={iconImage} style={{ width: "70%", height: "90%" }}></img>
          )}
        </div>
        <img
          src={ToBottomWhite}
          style={{
            width: "13px",
            height: "13px",
            marginLeft: "6px"
          }}
        />
      </div>
    </div>
  )
}
export default ChainListPage
