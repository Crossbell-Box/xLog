import { useTranslations } from "next-intl"
import { ChangeEvent } from "react"

import { Input } from "~/components/ui/Input"
import { useEditorState } from "~/hooks/useEditorState"
import { EditorValues } from "~/lib/types"

export default function EditorContent({
  updateValue,
  prompt,
}: {
  updateValue: (val: EditorValues) => void
  prompt?: string
}) {
  const t = useTranslations()
  const value = useEditorState((state) => state.content)

  return (
    <div>
      <Input
        label={t("Content") || ""}
        isBlock
        name="content"
        id="content"
        value={value}
        multiline
        rows={4}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          updateValue({
            content: e.target.value,
          })
        }}
        help={prompt}
      />
    </div>
  )
}
