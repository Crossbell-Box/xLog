"use client"

import { startTransition, useEffect, useState } from "react"

import Style from "../common/Style"

export const CSSPreviewConnect = () => {
  const [css, setCss] = useState("")

  useEffect(() => {
    const search = location.search
    const searchParams = new URLSearchParams(search)

    let targinOrigin = searchParams.get("origin")

    const isCSSPreview = searchParams.get("css-preview")

    if (!targinOrigin || !isCSSPreview) {
      return
    }
    targinOrigin = decodeURIComponent(targinOrigin)
    window.opener.postMessage("Preview Ready", targinOrigin)

    const handler = (e: MessageEvent) => {
      if (e.origin !== targinOrigin) {
        return
      }

      const parsedData = JSON.parse(e.data)

      if (parsedData.type === "preview") {
        const { css } = parsedData.data

        startTransition(() => {
          setCss(css)
        })
      }
    }

    window.addEventListener("message", handler)
    return () => {
      window.removeEventListener("message", handler)
    }
  }, [])

  return <Style content={css} />
}
