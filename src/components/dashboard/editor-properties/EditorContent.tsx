import { ChangeEvent } from "react"

import { Input } from "~/components/ui/Input"
import { Values, useEditorState } from "~/hooks/useEditorState"
import { useTranslation } from "~/lib/i18n/client"

export default function EditorContent({
  updateValue,
  prompt,
}: {
  updateValue: (val: Partial<Values>) => void
  prompt?: string
}) {
  const { t } = useTranslation("dashboard")
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
