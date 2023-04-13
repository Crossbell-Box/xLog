import { FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMediaStore } from "~/hooks/useDarkMode"
import { useIsUnmounted } from "~/hooks/useLifecycle"

export const Mermaid: FC<{
  children: [string]
}> = (props) => {
  const [loading, setLoading] = useState(true)
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
    import("mermaid").then(async (mo) => {
      const mermaid = mo.default
      const result = await mermaid.render("mermaid", props.children[0])

      if (isUnmounted()) return
      setSvg(result.svg)
      setLoading(false)
    })
  }, [props.children])

  const { t } = useTranslation("common")

  return loading ? (
    <div className="h-[50px] rounded-lg flex items-center justify-center bg-[#ECECFD] dark:bg-[#1F2020] text-sm">
      Mermaid {t("Loading")}...
    </div>
  ) : (
    <div dangerouslySetInnerHTML={{ __html: svg }} />
  )
}
