"use client"

import { FC, startTransition, useEffect, useState } from "react"

import { IS_DEV } from "~/lib/constants"
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

    const targinOrigin = IS_DEV ? "http://localhost:2222" : SITE_URL

    const isCSSPreview = searchParams.get("css-preview")

    if (!targinOrigin || !isCSSPreview) {
      return
    }
    window.opener.postMessage("Preview Ready", targinOrigin)

    const handler = (e: MessageEvent) => {
      if (e.origin !== targinOrigin) {
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

  return <Style content={currentStyle} />
}
