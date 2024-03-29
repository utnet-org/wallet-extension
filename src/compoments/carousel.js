import React, { useEffect, useState } from "react"
import Slider from "react-slick"

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import "../style.css"

import arrowPrimary from "data-base64:~assets/icons/arrow_primary.png"
import carouselImg1 from "data-base64:~assets/images/carousel_1.png"
import carouselImg2 from "data-base64:~assets/images/carousel_2.png"
import carouselImg3 from "data-base64:~assets/images/carousel_3.png"

import { Storage } from "@plasmohq/storage"
import TopStorage from "~db/user_storage";

import { createIntlObject } from "../i18n"

const images = [
  carouselImg1, // 替换为实际的图片路径
  carouselImg2,
  carouselImg3
]

const Carousel = () => {
  const storage = new Storage({
    area: "local"
  })

  const [intl, setIntl] = useState(() => {
    // 初始化时根据浏览器语言创建 intl 对象
    const userLanguage = navigator.language.toLowerCase()
    return createIntlObject(userLanguage)
  })

  const checkCurrentLanguage = async () => {
    const userLanguage = await TopStorage.getCurrentLanguage()
    setIntl(createIntlObject(userLanguage))
  }

  useEffect(() => {
    checkCurrentLanguage().catch((error) => {
      console.error("An error occurred:", error)
    })
  }, [storage])

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipe: false, // 禁用轮播图的滑动
    draggable: false, // 禁用轮播图的拖动
    autoplay: true, // 启用自动播放
    autoplaySpeed: 5000, // 切换间隔时间，单位为毫秒（这里设置为5秒）
    dots: true,
    centerMode: true,
    centerPadding: 0,
    pauseOnHover: false
  }

  return (
    <Slider {...settings}>
      {images.map((image, index) => (
        <div key={index}>
          <div>
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              style={{ width: "70%", paddingLeft: "15%" }}
            />
            <div className="overlay_top" style={{ paddingLeft: "12.5%" }}>
              <div
                className="flex_center_center"
                style={{ paddingBottom: "3%" }}>
                <img
                  src={arrowPrimary}
                  style={{ width: "14px", height: "10px", marginRight: "10px" }}
                />
                <div className="text_black_16_500">
                  {intl.formatMessage({ id: "start_journey" })}
                </div>
              </div>
              {index === 0 && (
                <div className="flex_center_center">
                  <div
                    className="text_black_60_400"
                    style={{ marginRight: "15px" }}>
                    {intl.formatMessage({ id: "welcome_to_use" })}
                  </div>
                  <div className="text_primary_60_400">Utility</div>
                </div>
              )}
              {index === 1 && (
                <div className="flex_center_center">
                  <div
                    className="text_black_60_400"
                    style={{ marginRight: "15px" }}>
                    {intl.formatMessage({ id: "manage" })}
                  </div>
                  <div
                    className="text_primary_60_400"
                    style={{ marginRight: "15px" }}>
                    {intl.formatMessage({ id: "crypto" })}
                  </div>
                  <div className="text_black_60_400">
                    {intl.formatMessage({ id: "assets" })}
                  </div>
                </div>
              )}
              {index === 2 && (
                <div className="flex_center_center">
                  <div
                    className="text_black_60_400"
                    style={{ marginRight: "15px" }}>
                    {intl.formatMessage({ id: "explore" })}
                  </div>
                  <div
                    className="text_primary_60_400"
                    style={{ marginRight: "15px" }}>
                    {intl.formatMessage({ id: "computing_power" })}
                  </div>
                  <div className="text_black_60_400">
                    {intl.formatMessage({ id: "networks" })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </Slider>
  )
}

export default Carousel
