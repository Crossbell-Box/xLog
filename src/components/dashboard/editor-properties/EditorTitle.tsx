import { ChangeEvent } from "react"

import { Input } from "~/components/ui/Input"
import { useEditorState } from "~/hooks/useEditorState"
import { useTranslation } from "~/lib/i18n/client"
import { EditorValues } from "~/lib/types"

export default function EditorTitle({
  updateValue,
}: {
  updateValue: (val: EditorValues) => void
}) {
  const { t } = useTranslation("dashboard")
  const value = useEditorState((state) => state.title)

  return (
    <div>
      <Input
        label={t("Title") || ""}
        isBlock
        name="title"
        id="title"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          updateValue({
            title: e.target.value,
          })
        }}
      />
    </div>
  )
}
