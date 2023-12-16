import type { CharacterEntity, NoteEntity } from "crossbell"
import { nanoid } from "nanoid"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"

import { EditorView } from "@codemirror/view"
import { useAccountState } from "@crossbell/connect-kit"
import { Popover } from "@headlessui/react"

import { editorUpload } from "~/components/dashboard/toolbars/Multimedia"
import { Avatar } from "~/components/ui/Avatar"
import { Button } from "~/components/ui/Button"
import CodeMirrorEditor from "~/components/ui/CodeMirror"
import { useUploadFile } from "~/hooks/useUploadFile"
import {
  useAnonymousComment,
  useCommentPage,
  useUpdateComment,
} from "~/queries/page"

import filter from "../../../data/filter.json"
import { Input } from "../ui/Input"
import { Tooltip } from "../ui/Tooltip"
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
  const t = useTranslations()
  const anonymousComment = useAnonymousComment()
  const [anonymous, setAnonymous] = useState(false)

  const [randomId] = useState(nanoid())

  const form = useForm({
    defaultValues: {
      content: comment?.metadata?.content?.content || "",
    },
  })

  const anonymousForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      url: "",
    } as {
      name: string
      email: string
      url: string
    },
  })

  const inputContent = form.watch("content").trim()

  const handleSubmit = form.handleSubmit(async (values) => {
    if (characterId && noteId) {
      if (comment) {
        if (values.content) {
          updateComment.mutate({
            content: values.content,
            characterId: comment.characterId,
            noteId: comment.noteId,
            originalCharacterId,
            originalNoteId,
          })
        }
      } else {
        if (anonymous) {
          if (
            values.content &&
            anonymousForm.getValues("name") &&
            anonymousForm.getValues("email")
          ) {
            anonymousComment.mutate({
              targetCharacterId: characterId,
              targetNoteId: noteId,
              content: values.content,
              name: anonymousForm.getValues("name"),
              email: anonymousForm.getValues("email"),
              url: anonymousForm.getValues("url"),
              originalCharacterId,
              originalNoteId,
            })
          }
        } else {
          commentPage.mutate({
            characterId,
            noteId,
            content: values.content,
            originalCharacterId,
            originalNoteId,
          })
        }
      }
    }
  })

  useEffect(() => {
    if (
      commentPage.isSuccess ||
      updateComment.isSuccess ||
      anonymousComment.isSuccess
    ) {
      form.reset()
      onSubmitted?.()
    }
  }, [
    commentPage.isSuccess,
    updateComment.isSuccess,
    anonymousComment.isSuccess,
    form,
    onSubmitted,
  ])

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

  if (account?.characterId && filter.comment.includes(account.characterId)) {
    return null
  }

  let submitText = "Connect"
  if (anonymous) {
    submitText = "Submit"
  } else if (account) {
    if (!account.character) {
      submitText = "Create Character"
    } else if (comment) {
      submitText = "Confirm Modification"
    } else {
      submitText = "Submit"
    }
  }

  let submitDisabled = false
  const name = anonymousForm.watch("name").trim()
  const email = anonymousForm.watch("email").trim()
  const url = anonymousForm.watch("url").trim()
  if (account?.character) {
    if (!inputContent || inputContent === comment?.metadata?.content?.content) {
      submitDisabled = true
    }
  } else if (anonymous) {
    if (!name || !email || !inputContent) {
      submitDisabled = true
    }
  }

  const id = `anonymous-${characterId}-${noteId}`

  return (
    <div className="xlog-comment-input flex">
      <Avatar
        cid={account?.character?.characterId || randomId}
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
            className="mb-2 p-3 h-[74px] border focus-within:border-accent border-[var(--border-color)] rounded-lg outline-2 outline-transparent cursor-text transition-colors"
            placeholder={t("Write a comment on the blockchain") || ""}
            maxLength={600}
            onCreateEditor={onCreateEditor}
            LoadingComponent={InputHolder}
          />
        </div>
        <div className="flex justify-between">
          <Popover className="relative justify-center">
            {({ open }: { open: boolean }) => (
              <>
                <Popover.Button className="group items-center rounded-md px-2 text-xl text-zinc-400 hover:text-zinc-500 hidden sm:inline-flex">
                  <span className="i-mingcute-emoji-2-line text-2xl"></span>
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
                        form.setValue("content", view.state.doc.toString())
                      })
                    }}
                  />
                </Popover.Panel>
              </>
            )}
          </Popover>
          <div className="flex items-center relative">
            {!account && (
              <div>
                <div className="mr-2 sm:mr-6 flex items-center">
                  <input
                    type="checkbox"
                    id={id}
                    name={id}
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                  />
                  <label
                    className="text-gray-500 pl-1 inline-flex items-center"
                    htmlFor={id}
                  >
                    {t("Comment Without Login")}
                    <Tooltip
                      label={t(
                        "You'll use an official public account for comments and give up blockchain ownership",
                      )}
                      childrenClassName="hidden sm:inline-flex ml-1"
                    >
                      <i className="i-mingcute-question-line" />
                    </Tooltip>
                  </label>
                </div>
                {anonymous && (
                  <div className="absolute right-0 top-full border rounded-lg px-6 pt-4 pb-5 space-y-2 bg-white z-10 mt-4">
                    <Input
                      label={t("Name") || ""}
                      id="name"
                      {...anonymousForm.register("name")}
                    />
                    <Input
                      label={t("Email") || ""}
                      id="email"
                      {...anonymousForm.register("email")}
                    />
                    <Input
                      label={t("URL (Optional)") || ""}
                      id="url"
                      {...anonymousForm.register("url")}
                    />
                  </div>
                )}
              </div>
            )}
            <Button
              type="submit"
              isLoading={
                commentPage.isLoading ||
                updateComment.isLoading ||
                anonymousComment.isLoading
              }
              isDisabled={submitDisabled}
            >
              {t(submitText)}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
