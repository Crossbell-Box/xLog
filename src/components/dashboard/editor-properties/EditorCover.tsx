import { useTranslations } from "next-intl"

import { FieldLabel } from "~/components/ui/FieldLabel"
import { ImageUploader } from "~/components/ui/ImageUploader"
import { useEditorState } from "~/hooks/useEditorState"
import { EditorValues } from "~/lib/types"

export default function EditorCover({
  updateValue,
  prompt,
  enableGlobalEvents,
}: {
  updateValue: (val: EditorValues) => void
  prompt?: string
  enableGlobalEvents?: boolean
}) {
  const t = useTranslations()
  const value = useEditorState((state) => state.cover)

  return (
    <div>
      <FieldLabel label={t("Cover Image")} />
      <ImageUploader
        className="aspect-video rounded-lg"
        value={value}
        hasClose={true}
        withMimeType={true}
        uploadEnd={(key) => {
          updateValue({
            cover: key,
          })
        }}
        accept="image/*"
        enableGlobalEvents={enableGlobalEvents}
      />
      {prompt && <div className="text-xs text-gray-400 mt-1">{prompt}</div>}
    </div>
  )
}
