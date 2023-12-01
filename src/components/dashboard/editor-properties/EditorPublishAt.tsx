import { DateInput } from "@mantine/dates"

import "@mantine/dates/styles.css"

import { useTranslations } from "next-intl"

import { useEditorState } from "~/hooks/useEditorState"
import { EditorValues } from "~/lib/types"

export default function EditorPublishAt({
  updateValue,
  prompt,
}: {
  updateValue: (val: EditorValues) => void
  prompt?: string
}) {
  const t = useTranslations()
  const value = useEditorState((state) => state.publishedAt)

  return (
    <div>
      <label className="form-label" htmlFor="publishAt">
        {t("Publish at")}
      </label>
      <DateInput
        className="[&_input]:text-black/90 [&_input]:bg-white [&_input:focus-within]:!border-accent [&_input]:rounded-lg [&_input]:h-10"
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
      />
      {prompt && <div className="text-xs text-gray-400 mt-1">{prompt}</div>}
      {value && value > new Date().toISOString() && (
        <div className="text-xs mt-1 text-orange-500">
          {t(
            "The post is currently not public as its publication date has been scheduled for a future time",
          )}
        </div>
      )}
    </div>
  )
}
