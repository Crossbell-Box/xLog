import Editor, { EditorProps } from "@monaco-editor/react"
import { useMonacoTheme } from "./use-theme"
import { useMediaStore } from "~/hooks/useDarkMode"

export function MonacoEditor(props: EditorProps) {
  const isDark = useMediaStore((state) => state.isDark)
  useMonacoTheme(isDark)

  return (
    // define initial theme
    <Editor {...props} theme={props.theme ?? (isDark ? "dark" : "light")} />
  )
}
