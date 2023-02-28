import React, { useRef } from "react"
import Lottie, { type LottieRefCurrentProps } from "lottie-react"
import LogoLottieJSON from "../../../public/assets/logo.json"
import { Image } from "~/components/ui/Image"

export const Logo: React.FC<{
  type: "svg" | "png" | "lottie"
  width?: number
  height?: number
}> = ({ type, width, height }) => {
  const ref = useRef<LottieRefCurrentProps>(null)

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
        <Lottie
          animationData={LogoLottieJSON}
          loop={false}
          lottieRef={ref}
          onMouseEnter={() => ref.current?.goToAndPlay(0)}
          style={{
            width: width || 100,
            height: height || 100,
          }}
        />
      )
  }
}
