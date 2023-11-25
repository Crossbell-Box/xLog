import { useTranslations } from "next-intl"
import { useCallback, useState } from "react"

import { FieldLabel } from "~/components/ui/FieldLabel"
import { ImageUploader } from "~/components/ui/ImageUploader"
import { useEditorState } from "~/hooks/useEditorState"
import { EditorValues } from "~/lib/types"

export default function EditorImages({
  updateValue,
  prompt,
}: {
  updateValue: (val: EditorValues) => void
  prompt?: string
}) {
  const t = useTranslations()
  const value = useEditorState((state) => state.images)
  const [extraValue, setExtraValue] = useState(undefined)

  const handleAddImage = useCallback(
    (key?: { address: string; mime_type: string }) => {
      if (key) {
        const tmpValue = [
          ...(value || []),
          {
            address: key.address,
            mime_type: key.mime_type,
          },
        ]
        updateValue({
          images: tmpValue,
        })
      }
      setExtraValue(undefined)
    },
    [value, updateValue],
  )

  return (
    <div>
      <FieldLabel label={t("Images")} />
      <div className="grid grid-cols-4 gap-2">
        {value?.map((image, index) => (
          <ImageUploader
            key={image.address}
            className="aspect-video rounded-lg"
            value={image}
            hasClose={true}
            withMimeType={true}
            uploadEnd={(key) => {
              const tmpValue = [...value]
              if (key) {
                tmpValue[index] = key
              } else {
                tmpValue.splice(index, 1)
              }
              updateValue({
                images: tmpValue,
              })
            }}
            accept="image/*"
          />
        ))}
        <ImageUploader
          key={"image"}
          className="aspect-video rounded-lg"
          withMimeType={true}
          value={extraValue}
          disablePreview={true}
          enableGlobalEvents={true}
          uploadEnd={handleAddImage}
          accept="image/*"
        />
      </div>
      {prompt && <div className="text-xs text-gray-400 mt-1">{prompt}</div>}
    </div>
  )
}
