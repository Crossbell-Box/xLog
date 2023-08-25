import { Input } from "~/components/ui/Input"
import { TagInput } from "~/components/ui/TagInput"
import { Values, useEditorState } from "~/hooks/useEditorState"
import { useTranslation } from "~/lib/i18n/client"
import { useGetDistinctNoteTagsOfCharacter } from "~/queries/page"

export default function EditorTags({
  updateValue,
  characterId,
}: {
  updateValue: (val: Partial<Values>) => void
  characterId?: number
}) {
  const { t } = useTranslation("dashboard")
  const value = useEditorState((state) => state.tags)

  const userTags = useGetDistinctNoteTagsOfCharacter(characterId)

  return (
    <div>
      <Input
        name="tags"
        value={value}
        label={t("Tags") || ""}
        id="tags"
        isBlock
        renderInput={(props) => (
          <TagInput
            {...props}
            userTags={userTags.data?.list ?? []}
            onTagChange={(value: string) =>
              updateValue({
                tags: value,
              })
            }
          />
        )}
      />
    </div>
  )
}
