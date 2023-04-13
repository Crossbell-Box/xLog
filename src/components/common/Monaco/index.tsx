import Editor, { EditorProps } from "@monaco-editor/react"
import { useMonacoTheme } from "./use-theme"

export function MonacoEditor(props: EditorProps) {
  useMonacoTheme()
  return <Editor {...props} />
}
