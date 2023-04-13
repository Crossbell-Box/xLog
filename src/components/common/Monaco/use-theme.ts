import { useMonaco } from "@monaco-editor/react"
import { useEffect } from "react"
import { useMediaStore } from "~/hooks/useDarkMode"
import Dark from "./theme/dark.json"
import Light from "./theme/light.json"

const set = new Set()
const useDefineTheme = (theme: string, json: any) => {
  const monaco = useMonaco()
  useEffect(() => {
    if (set.has(theme)) {
      return
    }

    if (monaco) {
      monaco.editor.defineTheme(theme, json)

      set.add(theme)
    }
  }, [monaco, theme])
}

export const useMonacoTheme = (isDark: boolean) => {
  useDefineTheme("light", Light)
  useDefineTheme("dark", Dark)

  const monaco = useMonaco()

  useEffect(() => {
    monaco?.editor.setTheme(isDark ? "dark" : "light")
  }, [monaco, isDark])
}
