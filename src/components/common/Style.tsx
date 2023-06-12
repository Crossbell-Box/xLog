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
  const previewCSSChannel = new BroadcastChannel("previewCSS")
  previewCSSChannel.onmessage = (msg) => {
    if (msg.data.ts > cssStateTs.current) {
      cssStateTs.current = msg.data.ts
      if (msg.data.css) {
        setCss(msg.data.css)
      } else {
        initCss()
      }
    }
  }

  // Preview CSS init
  const previewInitChannel = new BroadcastChannel("cssState")

  // Set CSS
  useEffect(() => {
    initCss()
    // Query for preview
    previewInitChannel.postMessage({})
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
