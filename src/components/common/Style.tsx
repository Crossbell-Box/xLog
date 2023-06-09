"use client"

import { useEffect, useState } from "react"

import { toGateway } from "~/lib/ipfs-parser"
import { getStorage } from "~/lib/storage"

const Style = ({
  content,
  children,
}: {
  content?: string
  children?: React.ReactNode[]
}) => {
  const [isPreviewingCss, setIsPreviewingCss] = useState(false)
  const [css, setCss] = useState(content)

  // Set CSS
  useEffect(() => {
    if (!isPreviewingCss) {
      // Check if preview css
      const savedCss = getStorage("cssPreview", true)
      if (savedCss) {
        setIsPreviewingCss(true)
        setCss(savedCss)
      } else {
        setIsPreviewingCss(false)
        if (content) {
          setCss(content)
        } else if (!css && typeof children?.[0] === "string") {
          setCss(children[0].trim())
        }
      }
    } // else just keep preview mode
  }, [content, children])

  return (
    <>
      {css && (
        <link
          type="text/css"
          rel="stylesheet"
          href={
            "data:text/css;base64," +
            Buffer.from(toGateway(css)).toString("base64")
          }
        />
      )}
    </>
  )
}

export default Style
