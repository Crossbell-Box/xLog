import type { CharacterEntity, NoteEntity } from "crossbell"
import { useCallback, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"

import { EditorView } from "@codemirror/view"
import { useAccountState } from "@crossbell/connect-kit"
import { Popover } from "@headlessui/react"

import { Avatar } from "~/components/ui/Avatar"
import { Button } from "~/components/ui/Button"
import { editorUpload } from "~/editor/Multimedia"
import { useUploadFile } from "~/hooks/useUploadFile"
import { useTranslation } from "~/lib/i18n/client"
import { useCommentPage, useUpdateComment } from "~/queries/page"

import { CodeMirrorEditor } from "../ui/CodeMirror"
import { Input } from "../ui/Input"
import { EmojiPicker } from "./EmojiPicker"

export const CommentInput = ({
  characterId,
  noteId,
  originalCharacterId,
  originalNoteId,
  onSubmitted,
  comment,
}: {
  characterId?: number
  noteId?: number
  originalCharacterId?: number
  originalNoteId?: number
  onSubmitted?: () => void
  comment?: NoteEntity & {
    character?: CharacterEntity | null
  }
}) => {
  const account = useAccountState((s) => s.computed.account)
  const commentPage = useCommentPage()
  const updateComment = useUpdateComment()
  const { t } = useTranslation("site")

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

  const cmViewRef = useRef<EditorView>()
  const onCreateEditor = useCallback((view: EditorView) => {
    cmViewRef.current = view
  }, [])

  const uploadFile = useUploadFile()
  const handleDropFile = useCallback(
    async (file: File) => {
      const view = cmViewRef.current
      if (view) {
        editorUpload(file, view)
      }
    },
    [uploadFile],
  )

  const InputHolder = useCallback(
    () => (
      <Input
        id="content"
        isBlock
        required={!!account?.character}
        disabled={!account?.character}
        multiline
        maxLength={600}
        className="mb-2"
        placeholder={t("Write a comment on the blockchain") || ""}
        {...form.register("content", {})}
      />
    ),
    [account?.character, t, form],
  )
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
          <CodeMirrorEditor
            value={form.watch("content")}
            {...form.register("content", {})}
            onChange={(val) => {
              form.setValue("content", val)
            }}
            handleDropFile={handleDropFile}
            className="mb-2 p-3 h-[74px] border focus-within:border-accent border-[var(--border-color)] rounded-lg outline-2 outline-transparent cursor-text"
            placeholder={t("Write a comment on the blockchain") || ""}
            maxLength={600}
            onCreateEditor={onCreateEditor}
            LoadingComponent={InputHolder}
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
                    onEmojiSelect={(e: any) => {
                      const emojiValue = e.native
                      const view = cmViewRef.current
                      if (!view) return
                      const state = view.state
                      const range = state.selection.ranges[0]
                      view.dispatch({
                        changes: {
                          from: range.from,
                          to: range.to,
                          insert: `${emojiValue}`,
                        },
                        selection: { anchor: range.from },
                      })

                      requestAnimationFrame(() => {
                        // console.log(view.state.doc.toString(), "statevalue")
                        form.setValue("content", view.state.doc.toString())
                      })
                    }}
                  />
                </Popover.Panel>
              </>
            )}
          </Popover>
          <Button
            type="submit"
            isLoading={commentPage.isLoading || updateComment.isLoading}
            isDisabled={
              !!account?.character &&
              (!inputContent ||
                inputContent === comment?.metadata?.content?.content)
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
