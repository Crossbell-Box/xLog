import { DateInput } from "@mantine/dates"

import { Values, useEditorState } from "~/hooks/useEditorState"
import { useTranslation } from "~/lib/i18n/client"

export default function EditorPublishAt({
  updateValue,
  prompt,
}: {
  updateValue: (val: Partial<Values>) => void
  prompt?: string
}) {
  const { t } = useTranslation("dashboard")
  const value = useEditorState((state) => state.publishedAt)

  return (
    <div>
      <label className="form-label" htmlFor="publishAt">
        {t("Publish at")}
      </label>
      <DateInput
        className="[&_input]:text-black/90 [&_input]:bg-white"
        allowDeselect
        clearable
        valueFormat="YYYY-MM-DD, h:mm a"
        name="publishAt"
        id="publishAt"
        value={value ? new Date(value) : undefined}
        onChange={(value: Date | null) => {
          if (value) {
            updateValue({
              publishedAt: value.toISOString(),
            })
          } else {
            updateValue({
              publishedAt: "",
            })
          }
        }}
        styles={{
          input: {
            borderRadius: "0.5rem",
            borderColor: "var(--border-color)",
            height: "2.5rem",
            "&:focus-within": {
              borderColor: "var(--theme-color)",
            },
          },
        }}
      />
      {prompt && <div className="text-xs text-gray-400 mt-1">{prompt}</div>}
      {value && value > new Date().toISOString() && (
        <div className="text-xs mt-1 text-orange-500">
          {t(
            "The post is currently not public as its publication date has been scheduled for a future time.",
          )}
        </div>
      )}
    </div>
  )
}
