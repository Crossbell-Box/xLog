import Editor, { EditorProps } from "@monaco-editor/react"

import { useIsDark } from "~/hooks/useDarkMode"

import { useMonacoTheme } from "./use-theme"

export function MonacoEditor(props: EditorProps) {
  const isDark = useIsDark()
  useMonacoTheme(isDark)

  return (
    // define initial theme
    <Editor {...props} theme={props.theme ?? (isDark ? "dark" : "light")} />
  )
}
