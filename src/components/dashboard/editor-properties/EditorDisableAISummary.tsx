import { useTranslations } from "next-intl"

import { Switch } from "~/components/ui/Switch"
import { useEditorState } from "~/hooks/useEditorState"
import { EditorValues } from "~/lib/types"

export default function EditorDisableAISummary({
  updateValue,
}: {
  updateValue: (val: EditorValues) => void
}) {
  const t = useTranslations()
  const value = useEditorState((state) => state.disableAISummary)

  return (
    <div>
      <label className="form-label">{t("Disable AI-generated summary")}</label>
      <Switch
        label=""
        checked={value || false}
        setChecked={(state) =>
          updateValue({
            disableAISummary: state,
          })
        }
      />
    </div>
  )
}
