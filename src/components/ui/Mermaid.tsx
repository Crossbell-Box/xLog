import { FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMediaStore } from "~/hooks/useDarkMode"
import { useIsUnmounted } from "~/hooks/useLifecycle"
import { nanoid } from "nanoid"

export const Mermaid: FC<{
  children: [string]
}> = (props) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [svg, setSvg] = useState("")
  const isUnmounted = useIsUnmounted()

  const isDark = useMediaStore((state) => state.isDark)

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
        }

        if (isUnmounted()) return

        if (result) {
          setSvg(result.svg)
          setError("")
        }
        setLoading(false)
      })
    }
  }, [props.children])

  const { t } = useTranslation("common")

  return loading ? (
    <div className="h-[50px] rounded-lg flex items-center justify-center bg-[#ECECFD] dark:bg-[#1F2020] text-sm">
      Mermaid {t("Loading")}...
    </div>
  ) : svg ? (
    <div dangerouslySetInnerHTML={{ __html: svg }} />
  ) : (
    <div className="h-[50px] rounded-lg flex items-center justify-center bg-red-100 text-sm">
      {error || "Error"}
    </div>
  )
}
