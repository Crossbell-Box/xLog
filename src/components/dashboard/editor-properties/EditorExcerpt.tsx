import { ChangeEvent } from "react"

import { Input } from "~/components/ui/Input"
import { useEditorState } from "~/hooks/useEditorState"
import { useTranslation } from "~/lib/i18n/client"
import { EditorValues } from "~/lib/types"

export default function EditorExcerpt({
  updateValue,
  prompt,
}: {
  updateValue: (val: EditorValues) => void
  prompt?: string
}) {
  const { t } = useTranslation("dashboard")
  const value = useEditorState((state) => state.excerpt)

  return (
    <div>
      <Input
        label={t("Excerpt") || ""}
        isBlock
        name="excerpt"
        id="excerpt"
        value={value}
        multiline
        rows={4}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          updateValue({
            excerpt: e.target.value,
          })
        }}
        help={prompt}
      />
    </div>
  )
}
