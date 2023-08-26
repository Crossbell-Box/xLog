import { Switch } from "~/components/ui/Switch"
import { useEditorState } from "~/hooks/useEditorState"
import { useTranslation } from "~/lib/i18n/client"
import { EditorValues } from "~/lib/types"

export default function EditorDisableAISummary({
  updateValue,
}: {
  updateValue: (val: EditorValues) => void
}) {
  const { t } = useTranslation("dashboard")
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
