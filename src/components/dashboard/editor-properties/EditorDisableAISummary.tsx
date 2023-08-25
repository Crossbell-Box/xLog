import { Switch } from "~/components/ui/Switch"
import { Values, useEditorState } from "~/hooks/useEditorState"
import { useTranslation } from "~/lib/i18n/client"

export default function EditorDisableAISummary({
  updateValue,
}: {
  updateValue: (val: Partial<Values>) => void
}) {
  const { t } = useTranslation("dashboard")
  const value = useEditorState((state) => state.disableAISummary)

  return (
    <div>
      <label className="form-label">{t("Disable AI-generated summary")}</label>
      <Switch
        label=""
        checked={value}
        setChecked={(state) =>
          updateValue({
            disableAISummary: state,
          })
        }
      />
    </div>
  )
}
