"use client"

import React, { useCallback, useEffect, useState } from "react"

import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { useTranslation } from "~/lib/i18n/client"

export const OIAButton: React.FC<{
  link: `/${string}`
  isInRN: boolean
}> = ({ link, isInRN }) => {
  const { t } = useTranslation("site")
  const [isVisible, setIsVisible] = useState(true)

  const oia = useCallback(() => {
    window.open(`https://oia.xlog.app${link}`, "_blank")
  }, [])

  const isMobileLayout = useIsMobileLayout()

  useEffect(() => {
    if (!isMobileLayout) {
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
  }, [isMobileLayout])

  if (!isMobileLayout || isInRN) {
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
