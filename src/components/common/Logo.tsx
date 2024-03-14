"use client"

import { useInViewport } from "ahooks"
import { type LottieRefCurrentProps } from "lottie-react"
import dynamic from "next/dynamic"
import React, { useRef } from "react"

import { Image } from "~/components/ui/Image"

import LogoLottieJSON from "../../../public/assets/logo.json"

const DynamicLottie = dynamic(() => import("lottie-react"))

export const Logo = ({
  type,
  width,
  height,
  loop,
  autoplay,
}: {
  type: "svg" | "png" | "lottie"
  width?: number
  height?: number
  loop?: boolean
  autoplay?: boolean
}) => {
  const ref = useRef<LottieRefCurrentProps>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView] = useInViewport(containerRef)

  switch (type) {
    case "svg":
      return (
        <Image
          alt="logo"
          src="/assets/logo.svg"
          width={width || 100}
          height={height || 100}
        />
      )
    case "png":
      return (
        <Image
          alt="logo"
          src="/assets/logo.png"
          width={width || 100}
          height={height || 100}
        />
      )
    case "lottie":
      return (
        <div
          ref={containerRef}
          style={{
            width: width || 100,
            height: height || 100,
          }}
        >
          {isInView && (
            <DynamicLottie
              animationData={LogoLottieJSON}
              loop={loop ?? false}
              autoplay={autoplay ?? true}
              lottieRef={ref}
              onMouseEnter={() => ref.current?.goToAndPlay(0)}
              className="xlog-lottie-logo text-black size-full"
            />
          )}
        </div>
      )
  }
}
