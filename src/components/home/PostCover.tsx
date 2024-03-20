"use client"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/scrollbar"

import { Mousewheel, Navigation, Scrollbar } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import { Image } from "~/components/ui/Image"
import { cn } from "~/lib/utils"

export default function PostCover({
  images,
  title,
  uniqueKey,
  className,
  imgClassName,
}: {
  images?: string[]
  title?: string
  uniqueKey?: string
  className?: string
  imgClassName?: string
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
              mousewheel={{
                forceToAxis: true,
              }}
              modules={[Navigation, Scrollbar, Mousewheel]}
              className="size-full"
            >
              {images?.map((image) => (
                <SwiperSlide key={image}>
                  <div className="text-[0px] size-full">
                    <Image
                      className={cn(
                        "object-cover size-full sm:group-hover:scale-105 sm:transition-transform sm:duration-400 sm:ease-in-out bg-white",
                        imgClassName,
                      )}
                      alt="cover"
                      src={image}
                      width={624}
                      height={351}
                    ></Image>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div
              id={`swiper-button-prev-${uniqueKey}`}
              className="swiper-button left-2"
            >
              <i className="i-mingcute-left-fill" />
            </div>
            <div
              id={`swiper-button-next-${uniqueKey}`}
              className="swiper-button right-2"
            >
              <i className="i-mingcute-right-fill" />
            </div>
          </>
        ) : images?.length === 1 ? (
          <Image
            className="object-cover size-full sm:group-hover:scale-105 sm:transition-transform sm:duration-400 sm:ease-in-out"
            alt="cover"
            src={images[0]}
            width={624}
            height={351}
          ></Image>
        ) : (
          <div className="xlog-post-cover rounded-t-2xl overflow-hidden flex items-center relative w-full aspect-video border-b">
            <div className="sm:group-hover:scale-105 sm:transition-transform sm:duration-400 sm:ease-in-out p-3 size-full text-center flex items-center justify-center">
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
