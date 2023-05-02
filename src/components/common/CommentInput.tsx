import { CharacterEntity, NoteEntity } from "crossbell.js"
import { useTranslation } from "next-i18next"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { useAccountState } from "@crossbell/connect-kit"
import { Popover } from "@headlessui/react"

import { Avatar } from "~/components/ui/Avatar"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { useCommentPage, useUpdateComment } from "~/queries/page"

import { EmojiPicker } from "./EmojiPicker"

export const CommentInput: React.FC<{
  characterId?: number
  noteId?: number
  originalCharacterId?: number
  originalNoteId?: number
  onSubmitted?: () => void
  comment?: NoteEntity & {
    character?: CharacterEntity | null
  }
}> = ({
  characterId,
  noteId,
  originalCharacterId,
  originalNoteId,
  onSubmitted,
  comment,
}) => {
  const account = useAccountState((s) => s.computed.account)
  const commentPage = useCommentPage()
  const updateComment = useUpdateComment()
  const { t } = useTranslation(["common", "site"])

  const form = useForm({
    defaultValues: {
      content: comment?.metadata?.content?.content || "",
    },
  })

  const inputContent = form.watch("content").trim()

  const handleSubmit = form.handleSubmit(async (values) => {
    if (characterId && noteId) {
      if (comment) {
        if (values.content) {
          updateComment.mutate({
            content: values.content,
            externalUrl: window.location.href,
            characterId: comment.characterId,
            noteId: comment.noteId,
            originalCharacterId,
            originalNoteId,
          })
        }
      } else {
        commentPage.mutate({
          characterId,
          noteId,
          content: values.content,
          externalUrl: window.location.href,
          originalCharacterId,
          originalNoteId,
        })
      }
    }
  })

  useEffect(() => {
    if (commentPage.isSuccess || updateComment.isSuccess) {
      form.reset()
      onSubmitted?.()
    }
  }, [commentPage.isSuccess, updateComment.isSuccess, form, onSubmitted])

  return (
    <div className="xlog-comment-input flex">
      <Avatar
        className="align-middle mr-3"
        images={account?.character?.metadata?.content?.avatars || []}
        name={account?.character?.metadata?.content?.name}
        size={45}
      />
      <form className="w-full" onSubmit={handleSubmit}>
        <div>
          <Input
            id="content"
            isBlock
            required={!!account?.character}
            disabled={!account?.character}
            multiline
            maxLength={600}
            className="mb-2"
            placeholder={
              t("Write a comment on the blockchain", { ns: "site" }) || ""
            }
            {...form.register("content", {})}
          />
        </div>
        <div className="flex justify-between">
          <Popover className="relative flex justify-center">
            {({ open }: { open: boolean }) => (
              <>
                <Popover.Button className="group inline-flex items-center rounded-md px-2 text-xl text-zinc-400 hover:text-zinc-500">
                  <span className="icon-[mingcute--emoji-2-line] text-2xl"></span>
                </Popover.Button>
                <Popover.Panel className="absolute left-0 top-full z-10">
                  <EmojiPicker
                    onEmojiSelect={(e: any) =>
                      form.setValue(
                        "content",
                        form.getValues("content") + e.native,
                      )
                    }
                  />
                </Popover.Panel>
              </>
            )}
          </Popover>
          <Button
            type="submit"
            isLoading={commentPage.isLoading || updateComment.isLoading}
            isDisabled={
              !!account?.character
                ? !!!inputContent ||
                  inputContent === comment?.metadata?.content?.content
                : false
            }
          >
            {t(
              account
                ? !account.character
                  ? "Create Character"
                  : comment
                  ? "Confirm Modification"
                  : "Submit"
                : "Connect",
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
