import "swiper/css"
import "swiper/css/effect-fade"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import uniqolor from "uniqolor"

import { Image } from "~/components/ui/Image"

export default function PostCover({
  images,
  title,
  uniqueKey,
}: {
  images?: string[]
  title?: string
  uniqueKey?: string
}) {
  if (!images) {
    if (title) {
      const bgAccent = uniqolor(title, {
        saturation: [30, 35],
        lightness: [60, 70],
      }).color

      const bgAccentLight = uniqolor(title, {
        saturation: [30, 35],
        lightness: [80, 90],
      }).color

      const bgAccentUltraLight = uniqolor(title, {
        saturation: [30, 35],
        lightness: [95, 96],
      }).color

      return (
        <>
          <div
            className="xlog-post-cover rounded-t-2xl overflow-hidden flex items-center justify-center text-center relative w-full aspect-video border-b p-2"
            style={{
              background: `linear-gradient(37deg, ${bgAccent} 27.82%, ${bgAccentLight} 79.68%, ${bgAccentUltraLight} 100%)`,
            }}
          >
            <div className="text-white text-xl font-bold">{title}</div>
          </div>
        </>
      )
    } else {
      return null
    }
  }

  return (
    <>
      <div className="xlog-post-cover rounded-t-2xl overflow-hidden flex items-center relative w-full aspect-video border-b">
        {images.length > 1 ? (
          <>
            <Swiper
              pagination={{
                type: "progressbar",
              }}
              loop={true}
              navigation={{
                prevEl: `#swiper-button-prev-${uniqueKey}`,
                nextEl: `#swiper-button-next-${uniqueKey}`,
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                waitForTransition: false,
              }}
              effect={"fade"}
              speed={1000}
              modules={[EffectFade, Autoplay, Pagination, Navigation]}
              className="w-full h-full"
            >
              {images.map((image) => (
                <SwiperSlide key={image}>
                  <Image
                    className="object-cover w-full sm:group-hover:scale-105 sm:transition-transform sm:duration-400 sm:ease-in-out"
                    alt="cover"
                    src={image}
                    width={624}
                    height={351}
                  ></Image>
                </SwiperSlide>
              ))}
            </Swiper>
            <div
              id={`swiper-button-prev-${uniqueKey}`}
              className="swiper-button left-2"
            >
              <i className="icon-[mingcute--left-fill]" />
            </div>
            <div
              id={`swiper-button-next-${uniqueKey}`}
              className="swiper-button right-2"
            >
              <i className="icon-[mingcute--right-fill]" />
            </div>
          </>
        ) : (
          <Image
            className="object-cover w-full sm:group-hover:scale-105 sm:transition-transform sm:duration-400 sm:ease-in-out"
            alt="cover"
            src={images[0]}
            width={624}
            height={351}
          ></Image>
        )}
      </div>
    </>
  )
}
