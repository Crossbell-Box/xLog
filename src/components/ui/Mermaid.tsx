"use client"

import type { Element } from "hast"
import { toText } from "hast-util-to-text"
import { nanoid } from "nanoid"
import { memo, useEffect, useState } from "react"

import { useIsDark } from "~/hooks/useDarkMode"

import AdvancedImage from "./AdvancedImage"

const Mermaid = memo(function Mermaid(props: {
  children: string
  node: Element
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [svg, setSvg] = useState("")
  const [width, setWidth] = useState<number>()
  const [height, setHeight] = useState<number>()
  const text = toText(props.node, {
    whitespace: "pre",
  })

  const isDark = useIsDark()

  useEffect(() => {
    import("mermaid").then(async (mo) => {
      const mermaid = mo.default
      mermaid.initialize({
        theme: isDark ? "dark" : "default",
      })
    })
  }, [isDark])

  useEffect(() => {
    if (text) {
      setError("")
      setLoading(true)

      import("mermaid").then(async (mo) => {
        const mermaid = mo.default
        const id = nanoid()
        let result
        try {
          result = await mermaid.render(`mermaid-${id}`, text)
        } catch (error) {
          document.getElementById(`dmermaid-${id}`)?.remove()
          if (error instanceof Error) {
            setError(error.message)
          }
          setSvg("")
          setWidth(undefined)
          setHeight(undefined)
        }

        if (result) {
          setSvg(result.svg)

          const match = result.svg.match(/viewBox="[^"]*\s([\d.]+)\s([\d.]+)"/)
          if (match?.[1] && match?.[2]) {
            setWidth(parseInt(match?.[1]))
            setHeight(parseInt(match?.[2]))
          }
          setError("")
        }
        setLoading(false)
      })
    }
  }, [text])

  return loading ? (
    <div className="min-h-[50px] rounded-lg flex items-center justify-center bg-[#ECECFD] dark:bg-[#1F2020] text-sm">
      Mermaid Loading...
    </div>
  ) : svg ? (
    <div>
      <AdvancedImage
        alt="mermaid"
        src={"data:image/svg+xml;base64," + Buffer.from(svg).toString("base64")}
        width={width}
        height={height}
      />
    </div>
  ) : (
    <div className="min-h-[50px] rounded-lg flex items-center justify-center bg-red-100 text-sm">
      {error || "Error"}
    </div>
  )
})

export default Mermaid
