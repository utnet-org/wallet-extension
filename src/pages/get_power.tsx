import GetBackImage from "data-base64:~assets/icons/get_back.png"
import logoImg from "data-base64:~assets/icons/logo.png"
import ToRgihtImage from "data-base64:~assets/icons/move_toright.png"
import RefreshImage from "data-base64:~assets/icons/refresh.png"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

function GetPower() {
  const navigate = useNavigate()
  const [defalutIndex, setDefalutIndex] = useState(0) // 默认选中的tab
  const changeDefalutIndex = (index: number) => {
    setDefalutIndex(index)
  }
  const progressList = [
    {
      address: "0x000000...00000",
      beforAmount: "10000",
      afterAmount: "12000",
      quantity: 16,
      price: 1.234
    },
    {
      address: "0x000000...00000",
      beforAmount: "10000",
      afterAmount: "12000",
      quantity: 16,
      price: 1.234
    },
    {
      address: "0x000000...00000",
      beforAmount: "10000",
      afterAmount: "12000",
      quantity: 16,
      price: 1.234
    },
    {
      address: "0x000000...00000",
      beforAmount: "10000",
      afterAmount: "12000",
      quantity: 16,
      price: 1.234
    },
    {
      address: "0x000000...00000",
      beforAmount: "10000",
      afterAmount: "12000",
      quantity: 16,
      price: 1.234
    }
  ]
  const finishedList = [
    {
      address: "0x000000...00000",
      beforAmount: "10000",
      afterAmount: "12000",
      quantity: 16,
      price: 1.234
    },
    {
      address: "0x000000...00000",
      beforAmount: "10000",
      afterAmount: "12000",
      quantity: 16,
      price: 1.234
    },
    {
      address: "0x000000...00000",
      beforAmount: "10000",
      afterAmount: "12000",
      quantity: 16,
      price: 1.234
    }
  ]
  document.title = "getPower"
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
          height: "67px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}>
        <img
          onClick={() => {
            navigate(-1)
          }}
          src={GetBackImage}
          alt=""
          style={{
            width: "24px",
            height: "24px",
            position: "absolute",
            top: "23px",
            left: "20px"
          }}
        />
        <div
          style={{
            textAlign: "center",
            color: "rgba(21.29, 27.63, 26.10, 0.90)",
            fontSize: 18,
            fontFamily: "Lantinghei SC",
            fontWeight: "400",
            wordWrap: "break-word"
          }}>
          Getpower
        </div>
      </div>
      <div
        style={{
          width: "100",
          flex: 1,
          boxShadow: "0px 1px 1px 1px rgba(223.26, 230.95, 230.02, 0.50) inset",
          borderRadius: 10,
          margin: "0 20px 20px",
          padding: "12px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column"
        }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridColumnGap: "9px",
            alignItems: "center",
            justifyContent: "space-evenly",
            marginBottom: "20px"
          }}>
          <div
            onClick={() => {
              changeDefalutIndex(0)
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "7px",
              textAlign: "center",
              cursor: "pointer",
              fontSize: "15px",
              color: defalutIndex === 0 ? "white" : "",
              backgroundColor: defalutIndex === 0 ? "#3EDFCF" : ""
            }}>
            In Progress
          </div>
          <div
            onClick={() => {
              changeDefalutIndex(1)
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "7px",
              textAlign: "center",
              cursor: "pointer",
              fontSize: "15px",
              color: defalutIndex === 1 ? "white" : "",
              backgroundColor: defalutIndex === 1 ? "#3EDFCF" : ""
            }}>
            Finished
          </div>
        </div>
        <div
          style={{
            width: "100%",
            maxHeight: "340px",
            // flex: 1,
            overflowY: "auto"
          }}>
          {defalutIndex == 0 &&
            progressList.map((item, index) => (
              <div
                style={{
                  width: "100%",
                  flex: 1,
                  padding: "0 8px 24px",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "start",
                  cursor: "pointer",
                  overflow: "hidden"
                }}>
                <img
                  src={logoImg}
                  alt=""
                  style={{ width: "30px", height: "30px" }}
                />
                <div
                  style={{
                    margin: "0 10px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                    justifyContent: "flex-start"
                  }}>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(21.29, 27.63, 26.10, 0.60)",
                        fontWeight: 400,
                        marginBottom: "2px"
                      }}>
                      {item.address}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center"
                      }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {item.beforAmount}
                      </div>
                      <img
                        src={ToRgihtImage}
                        alt=""
                        style={{ width: "10px", margin: "0 4px" }}
                      />
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {item.afterAmount}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    justifyContent: "flex-start"
                  }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(21.29, 27.63, 26.10, 0.60)",
                      fontWeight: 400,
                      marginBottom: "2px"
                    }}>
                    {item.quantity}T
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#3EDFCF",
                      fontWeight: 400
                    }}>
                    {item.price} U
                  </div>
                </div>
              </div>
            ))}
          {defalutIndex == 1 &&
            finishedList.map((item, index) => (
              <div
                style={{
                  width: "100%",
                  flex: 1,
                  padding: "0 8px 24px",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "start",
                  cursor: "pointer",
                  overflow: "hidden"
                }}>
                <img
                  src={logoImg}
                  alt=""
                  style={{ width: "30px", height: "30px" }}
                />
                <div
                  style={{
                    margin: "0 10px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                    justifyContent: "flex-start"
                  }}>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(21.29, 27.63, 26.10, 0.60)",
                        fontWeight: 400,
                        marginBottom: "2px"
                      }}>
                      {item.address}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center"
                      }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {item.beforAmount}
                      </div>
                      <img
                        src={ToRgihtImage}
                        alt=""
                        style={{ width: "10px", margin: "0 4px" }}
                      />
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {item.afterAmount}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    justifyContent: "flex-start"
                  }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(21.29, 27.63, 26.10, 0.60)",
                      fontWeight: 400,
                      marginBottom: "2px"
                    }}>
                    {item.quantity}T
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#3EDFCF",
                      fontWeight: 400
                    }}>
                    {item.price} U
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          marginLeft: "22px"
        }}>
        <img
          src={RefreshImage}
          alt=""
          style={{
            width: "20px",
            height: "20px",
            marginRight: "6px",
            cursor: "pointer"
          }}
        />
        <div
          style={{
            fontSize: "13px",
            fontWeight: 400,
            color: "#3EDFCF",
            cursor: "pointer"
          }}>
          Refresh list
        </div>
      </div>
    </div>
  )
}
export default GetPower
