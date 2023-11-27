import { useTranslations } from "next-intl"
import { ChangeEvent } from "react"

import { Input } from "~/components/ui/Input"
import { useEditorState } from "~/hooks/useEditorState"
import { EditorValues } from "~/lib/types"

export default function EditorExcerpt({
  updateValue,
  prompt,
}: {
  updateValue: (val: EditorValues) => void
  prompt?: string
}) {
  const t = useTranslations()
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
