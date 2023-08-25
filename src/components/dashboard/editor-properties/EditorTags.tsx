import { Input } from "~/components/ui/Input"
import { TagInput } from "~/components/ui/TagInput"
import { useEditorState } from "~/hooks/useEditorState"
import { useTranslation } from "~/lib/i18n/client"
import { EditorValues } from "~/lib/types"
import { useGetDistinctNoteTagsOfCharacter } from "~/queries/page"

export default function EditorTags({
  updateValue,
  characterId,
}: {
  updateValue: (val: Partial<EditorValues>) => void
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
