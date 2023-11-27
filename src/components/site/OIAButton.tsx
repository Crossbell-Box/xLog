"use client"

import { useTranslations } from "next-intl"
import React, { useCallback, useEffect, useState } from "react"

import { isMobileDevice } from "~/lib/utils"

export const OIAButton = ({
  link,
  isInRN,
}: {
  link: `/${string}`
  isInRN: boolean
}) => {
  const t = useTranslations()
  const [isVisible, setIsVisible] = useState(true)

  const oia = useCallback(() => {
    window.open(`https://oia.xlog.app${link}`, "_blank")
  }, [])

  const enabled = isMobileDevice() && !isInRN

  useEffect(() => {
    if (!enabled) {
      return
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const handleScroll = () => {
      setIsVisible(false)
      timeoutId && clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setIsVisible(true), 1000)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!enabled) {
    return null
  }

  return (
    <button
      onClick={oia}
      className={`fixed bottom-[10%] left-1/2 -translate-x-1/2 bg-black rounded-3xl px-5 py-3 text-accent z-50 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {t("Open in App")}
    </button>
  )
}
