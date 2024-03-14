"use client"

import { useTranslations } from "next-intl"
import { useCallback, useEffect } from "react"

import { Image } from "~/components/ui/Image"

function OIAPage() {
  const t = useTranslations()

  useEffect(() => {
    document.body.style.backgroundColor = "#fb9148"
    return () => {
      document.body.style.backgroundColor = ""
    }
  }, [])

  const isAndroid = () => {
    const userAgent = navigator.userAgent || navigator.vendor
    return /android/i.test(userAgent)
  }

  const download = useCallback(() => {
    if (isAndroid()) {
      window.open(
        "https://play.google.com/store/apps/details?id=com.crossbell.xlog",
      )
    } else {
      window.open(
        "itms-apps://apps.apple.com/app/xlog-on-chain-blogging/id6449499296",
      )
    }
  }, [])

  const goBack = useCallback(() => {
    window.history.back()
  }, [])

  return (
    <div className="relative h-screen w-screen bg-accent max-w-4xl m-auto">
      <Image
        fill
        className="object-cover absolute size-full"
        src="/assets/download-preview.png"
        alt="Download Preview"
      />
      <div className="absolute top-5 w-full text-xs text-center text-[white]">
        {t("Pull down to open the app")}
      </div>
      <button
        className="absolute left-1/2 -translate-x-1/2 bottom-[15%] text-accent px-4 py-2 rounded-[25px] w-[56.5%] bg-[white]"
        onClick={download}
      >
        {t("Download")}
      </button>
      <button
        className="absolute left-1/2 -translate-x-1/2 translate-y-[150%] bottom-[15%] text-[white] px-4 py-2 rounded-[25px] w-[56.5%]"
        onClick={goBack}
      >
        {t("Cancel Download")}
      </button>
    </div>
  )
}

export default OIAPage
