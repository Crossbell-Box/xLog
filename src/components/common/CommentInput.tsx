import { CharacterEntity, NoteEntity } from "crossbell.js"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { useAccountState } from "@crossbell/connect-kit"
import { Popover } from "@headlessui/react"

import { Avatar } from "~/components/ui/Avatar"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { Profile } from "~/lib/types"
import { useCommentPage, useUpdateComment } from "~/queries/page"
import { useAccountSites } from "~/queries/site"

import { EmojiPicker } from "./EmojiPicker"

export const CommentInput: React.FC<{
  pageId?: string
  originalId?: string
  onSubmitted?: () => void
  comment?: NoteEntity & {
    character?: CharacterEntity | null
  }
}> = ({ pageId, originalId, onSubmitted, comment }) => {
  const account = useAccountState((s) => s.computed.account)
  const userSites = useAccountSites()
  const commentPage = useCommentPage()
  const updateComment = useUpdateComment()
  const router = useRouter()
  const [viewer, setViewer] = useState<Profile | null>(null)
  const { t } = useTranslation(["common", "site"])

  useEffect(() => {
    if (userSites.isSuccess && userSites.data?.length) {
      setViewer(userSites.data[0])
    }
  }, [userSites, router])

  const form = useForm({
    defaultValues: {
      content: comment?.metadata?.content?.content || "",
    },
  })

  const isLogin = useMemo(
    () => !!account && userSites.isSuccess && !!userSites.data?.length,
    [account, userSites],
  )
  const inputContent = form.watch("content").trim()

  const handleSubmit = form.handleSubmit(async (values) => {
    if (pageId) {
      if (comment) {
        if (values.content) {
          updateComment.mutate({
            pageId,
            content: values.content,
            externalUrl: window.location.href,
            originalId,
            characterId: comment.characterId,
            noteId: comment.noteId,
          })
        }
      } else {
        commentPage.mutate({
          pageId: pageId,
          content: values.content,
          externalUrl: window.location.href,
          originalId: originalId,
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
        images={viewer?.avatars || []}
        name={viewer?.name}
        size={45}
      />
      <form className="w-full" onSubmit={handleSubmit}>
        <div>
          <Input
            id="content"
            isBlock
            required={isLogin}
            disabled={
              !account || !userSites.isSuccess || !userSites.data?.length
            }
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
            isLoading={
              userSites.isLoading ||
              commentPage.isLoading ||
              updateComment.isLoading
            }
            isDisabled={
              isLogin
                ? !!!inputContent ||
                  inputContent === comment?.metadata?.content?.content
                : false
            }
          >
            {t(
              account
                ? userSites.isSuccess && !userSites.data?.length
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
