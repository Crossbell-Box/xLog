import { ChangeEvent } from "react"

import { Input } from "~/components/ui/Input"
import { Values, useEditorState } from "~/hooks/useEditorState"
import { useTranslation } from "~/lib/i18n/client"

export default function EditorExcerpt({
  updateValue,
  prompt,
}: {
  updateValue: (val: Partial<Values>) => void
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
