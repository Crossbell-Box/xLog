import { nanoid } from "nanoid"
import { FC, memo, useEffect, useState } from "react"

import { useIsDark } from "~/hooks/useDarkMode"
import { useIsUnmounted } from "~/hooks/useLifecycle"

import { Image } from "./Image"

export const Mermaid: FC<{
  children: [string]
}> = memo(
  function Mermaid(props) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [svg, setSvg] = useState("")
    const [width, setWidth] = useState<number>()
    const [height, setHeight] = useState<number>()
    const isUnmounted = useIsUnmounted()

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
      if (props.children?.[0]) {
        setError("")
        setLoading(true)

        import("mermaid").then(async (mo) => {
          const mermaid = mo.default
          const id = nanoid()
          let result
          try {
            result = await mermaid.render(`mermaid-${id}`, props.children[0])
          } catch (error) {
            if (error instanceof Error) {
              setError(error.message)
            }
            setSvg("")
            setWidth(undefined)
            setHeight(undefined)
          }

          if (isUnmounted()) return

          if (result) {
            setSvg(result.svg)

            const match = result.svg.match(
              /viewBox="[^"]*\s([\d.]+)\s([\d.]+)"/,
            )
            if (match?.[1] && match?.[2]) {
              setWidth(parseInt(match?.[1]))
              setHeight(parseInt(match?.[2]))
            }
            setError("")
          }
          setLoading(false)
        })
      }
    }, [props.children, isDark])

    return loading ? (
      <div className="min-h-[50px] rounded-lg flex items-center justify-center bg-[#ECECFD] dark:bg-[#1F2020] text-sm">
        Mermaid Loading...
      </div>
    ) : svg ? (
      <div>
        <Image
          alt="mermaid"
          src={
            "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64")
          }
          width={width}
          height={height}
        />
      </div>
    ) : (
      <div className="min-h-[50px] rounded-lg flex items-center justify-center bg-red-100 text-sm">
        {error || "Error"}
      </div>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.children?.[0] === nextProps.children?.[0]
  },
)
