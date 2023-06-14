"use client"

import { useEffect, useRef, useState } from "react"

import { toGateway } from "~/lib/ipfs-parser"

const Style = ({
  content,
  children,
}: {
  content?: string
  children?: React.ReactNode[]
}) => {
  const cssStateTs = useRef(new Date(0))
  const [css, setCss] = useState("")
  const isPreviewingCSS = useRef(false)

  // Init CSS
  const initCss = () => {
    if (content) {
      setCss(content)
    } else if (typeof children?.[0] === "string") {
      setCss(children[0].trim())
    } else {
      setCss("") // Nothing
    }
  }

  // Preview CSS
  useEffect(() => {
    const previewCSSChannel = new BroadcastChannel("previewCSS")
    previewCSSChannel.onmessage = (msg) => {
      if (msg.data.type === "update" && msg.data.ts > cssStateTs.current) {
        isPreviewingCSS.current = true
        cssStateTs.current = msg.data.ts
        if (msg.data.css) {
          setCss(msg.data.css)
        } else {
          initCss()
        }
      }
    }

    // Query for preview
    previewCSSChannel.postMessage({
      type: "fetch",
    })
  }, [])

  // Set CSS
  useEffect(() => {
    if (!isPreviewingCSS.current) {
      initCss()
    }
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
