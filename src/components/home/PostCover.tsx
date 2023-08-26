"use client"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/scrollbar"
import { Navigation, Scrollbar } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import { Image } from "~/components/ui/Image"
import { cn } from "~/lib/utils"

export default function PostCover({
  images,
  title,
  uniqueKey,
  className,
}: {
  images?: string[]
  title?: string
  uniqueKey?: string
  className?: string
}) {
  return (
    <>
      <div
        className={cn(
          "xlog-post-cover rounded-t-2xl overflow-hidden flex items-center relative w-full aspect-video border-b",
          className,
        )}
      >
        {(images?.length || 0) > 1 ? (
          <>
            <Swiper
              loop={true}
              navigation={{
                prevEl: `#swiper-button-prev-${uniqueKey}`,
                nextEl: `#swiper-button-next-${uniqueKey}`,
              }}
              scrollbar={{
                hide: true,
              }}
              modules={[Navigation, Scrollbar]}
              className="w-full h-full"
            >
              {images?.map((image) => (
                <SwiperSlide key={image}>
                  <Image
                    className="object-cover w-full sm:group-hover:scale-105 sm:transition-transform sm:duration-400 sm:ease-in-out bg-white"
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
        ) : images?.length === 1 ? (
          <Image
            className="object-cover w-full sm:group-hover:scale-105 sm:transition-transform sm:duration-400 sm:ease-in-out"
            alt="cover"
            src={images[0]}
            width={624}
            height={351}
          ></Image>
        ) : (
          <div className="xlog-post-cover rounded-t-2xl overflow-hidden flex items-center relative w-full aspect-video border-b">
            <div className="sm:group-hover:scale-105 sm:transition-transform sm:duration-400 sm:ease-in-out p-3 w-full h-full text-center flex items-center justify-center">
              <div className="text-zinc-600 text-xl font-extrabold">
                {title}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
