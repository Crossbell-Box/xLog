import { FieldLabel } from "~/components/ui/FieldLabel"
import { ImageUploader } from "~/components/ui/ImageUploader"
import { Values, useEditorState } from "~/hooks/useEditorState"
import { useTranslation } from "~/lib/i18n/client"

export default function EditorCover({
  updateValue,
  prompt,
}: {
  updateValue: (val: Partial<Values>) => void
  prompt?: string
}) {
  const { t } = useTranslation("dashboard")
  const value = useEditorState((state) => state.cover)

  return (
    <div>
      <FieldLabel label={t("Cover Image")} />
      <ImageUploader
        id="icon"
        className="aspect-video rounded-lg"
        value={value as any}
        hasClose={true}
        withMimeType={true}
        uploadEnd={(key) => {
          const { address, mime_type } = key as Values["cover"]
          updateValue({
            cover: {
              address,
              mime_type,
            },
          })
        }}
        accept="image/*"
      />
      {prompt && <div className="text-xs text-gray-400 mt-1">{prompt}</div>}
    </div>
  )
}
