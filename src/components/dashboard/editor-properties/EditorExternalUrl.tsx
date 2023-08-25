import { ChangeEvent } from "react"

import { Input } from "~/components/ui/Input"
import { Values, useEditorState } from "~/hooks/useEditorState"
import { useTranslation } from "~/lib/i18n/client"

export default function EditorExternalUrl({
  updateValue,
}: {
  updateValue: (val: Partial<Values>) => void
}) {
  const { t } = useTranslation("dashboard")
  const value = useEditorState((state) => state.externalUrl)

  return (
    <div>
      <Input
        label={t("External Url") || ""}
        isBlock
        name="externalUrl"
        id="externalUrl"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          updateValue({
            externalUrl: e.target.value,
          })
        }}
      />
    </div>
  )
}
