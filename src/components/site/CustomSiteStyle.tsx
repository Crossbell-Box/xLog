"use client"

import { FC, startTransition, useEffect, useState } from "react"

import { SITE_URL } from "~/lib/env"

import Style from "../common/Style"

export const CustomSiteStyle: FC<{
  content: string
}> = (props) => {
  const { content } = props
  const [currentStyle, setCurrentStyle] = useState(content)

  useEffect(() => {
    setCurrentStyle(content)
  }, [content])

  useEffect(() => {
    const search = location.search
    const searchParams = new URLSearchParams(search)

    const isCSSPreview = searchParams.get("css-preview")

    if (!SITE_URL || !isCSSPreview) {
      return
    }
    window.opener.postMessage("Preview Ready", SITE_URL)

    const handler = (e: MessageEvent) => {
      if (e.origin !== SITE_URL) {
        return
      }

      const parsedData = JSON.parse(e.data)

      if (parsedData.type === "preview") {
        const { css } = parsedData.data

        startTransition(() => {
          setCurrentStyle(css)
        })
      }
    }

    window.addEventListener("message", handler)
    return () => {
      window.removeEventListener("message", handler)
    }
  }, [])

  return <Style>{currentStyle}</Style>
}
