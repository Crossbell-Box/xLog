"use client"

import type { CharacterEntity, NoteEntity } from "crossbell"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { useAccountState } from "@crossbell/connect-kit"
import { useQueryClient } from "@tanstack/react-query"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { CommentInput } from "~/components/common/CommentInput"
import { DeleteConfirmationModal } from "~/components/common/DeleteConfirmationModal"
import MarkdownContent from "~/components/common/MarkdownContent"
import { ReactionLike } from "~/components/common/ReactionLike"
import { Titles } from "~/components/common/Titles"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { Avatar } from "~/components/ui/Avatar"
import { Button } from "~/components/ui/Button"
import { UniLink } from "~/components/ui/UniLink"
import { useDate } from "~/hooks/useDate"
import { CSB_SCAN } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { cn } from "~/lib/utils"
import { useDeletePage } from "~/queries/page"

export const CommentItem = ({
  comment,
  originalCharacterId,
  originalNoteId,
  depth,
  className,
}: {
  comment: NoteEntity & {
    character?: CharacterEntity | null
  }
  originalCharacterId?: number
  originalNoteId?: number
  depth: number
  className?: string
}) => {
  const [replyOpen, setReplyOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false)

  const t = useTranslations()
  const date = useDate()
  const queryClient = useQueryClient()
  const deletePage = useDeletePage()

  const account = useAccountState(({ computed }) => computed.account)

  useEffect(() => {
    queryClient.refetchQueries([
      "getComments",
      originalCharacterId,
      originalNoteId,
    ])
  }, [deletePage.isSuccess, originalCharacterId, originalNoteId, queryClient])

  if (!comment.metadata?.content?.content) {
    return null
  }

  const displayName = comment?.metadata?.content?.attributes?.find(
    (attribute) => attribute.trait_type === "xlog_sender_name",
  )?.value as string | undefined
  const displayUrl = comment?.metadata?.content?.attributes?.find(
    (attribute) => attribute.trait_type === "xlog_sender_url",
  )?.value as string | undefined

  return (
    <div
      className={cn(depth > 0 ? "" : "border-b border-dashed pb-6", className)}
    >
      <div className="flex group">
        <div>
          <CharacterFloatCard siteId={comment?.character?.handle}>
            <div>
              <UniLink
                href={
                  displayUrl ||
                  (comment?.character?.handle &&
                    getSiteLink({
                      subdomain: comment.character.handle,
                    }))
                }
                className="block align-middle mr-3"
              >
                <Avatar
                  cid={displayName || comment?.character?.characterId}
                  images={
                    displayName
                      ? []
                      : comment?.character?.metadata?.content?.avatars || []
                  }
                  name={
                    displayName || comment?.character?.metadata?.content?.name
                  }
                  size={45}
                />
              </UniLink>
            </div>
          </CharacterFloatCard>
        </div>
        <div className="flex-1 flex flex-col rounded-lg min-w-0">
          <div className="mb-1 text-sm flex items-center space-x-1">
            <UniLink
              href={
                displayUrl ||
                (comment?.character?.handle &&
                  getSiteLink({
                    subdomain: comment.character.handle,
                  }))
              }
              className="font-medium text-accent"
            >
              {displayName || comment?.character?.metadata?.content?.name}
            </UniLink>
            <Titles characterId={comment.characterId} />
            <span>·</span>
            <time dateTime={date.formatToISO(comment?.createdAt)}>
              {t("ago", {
                time: date.dayjs
                  .duration(
                    date.dayjs(comment?.createdAt).diff(date.dayjs(), "minute"),
                    "minute",
                  )
                  .humanize(),
              })}
            </time>
            <span>·</span>
            <UniLink
              href={`${CSB_SCAN}/tx/${comment.transactionHash}`}
              className="inline-flex items-center h-full"
            >
              <BlockchainIcon className="inline-block" />
            </UniLink>
          </div>
          <MarkdownContent
            content={comment.metadata?.content?.content}
            strictMode={true}
          ></MarkdownContent>
          <div className="mt-1 flex items-center">
            <div
              className="xlog-reactions fill-gray-400 text-gray-500 sm:items-center inline-flex text-sm space-x-3"
              data-hide-print
            >
              <ReactionLike
                size="sm"
                characterId={comment.characterId}
                noteId={comment.noteId}
              />
            </div>
            {depth < 2 && (
              <Button
                className="text-gray-500 text-[13px] ml-1 -mt-px"
                variant="text"
                onClick={() => setReplyOpen(!replyOpen)}
              >
                {t(`${replyOpen ? "Cancel " : ""}Reply`)}
                {!replyOpen && (
                  <span className="ml-1">
                    {(comment as any)?.fromNotes?.count || 0}
                  </span>
                )}
              </Button>
            )}
            {comment.characterId === account?.characterId && (
              <Button
                className="text-gray-500 text-[13px] -mt-px"
                variant="text"
                onClick={() => setEditOpen(!editOpen)}
              >
                <i className="i-mingcute-edit-line mx-1" />{" "}
                {t(`${editOpen ? "Cancel " : ""}Edit`)}
              </Button>
            )}
            {comment.characterId === account?.characterId &&
              !(comment as any)?.fromNotes?.list?.length && (
                <>
                  <Button
                    className="text-gray-500 text-[13px] -mt-px"
                    variant="text"
                    onClick={() => setDeleteConfirmModalOpen(true)}
                    isLoading={deletePage.isLoading}
                  >
                    <i className="i-mingcute-delete-2-line mx-1" />{" "}
                    {t("Delete")}
                  </Button>
                  <DeleteConfirmationModal
                    open={deleteConfirmModalOpen}
                    setOpen={setDeleteConfirmModalOpen}
                    onConfirm={() =>
                      deletePage.mutate({
                        noteId: comment.noteId,
                        characterId: comment.characterId,
                      })
                    }
                    type="comment"
                  />
                </>
              )}
          </div>
          {replyOpen && (
            <div className="pt-6">
              <CommentInput
                originalCharacterId={originalCharacterId}
                originalNoteId={originalNoteId}
                characterId={comment.characterId}
                noteId={comment.noteId}
                onSubmitted={() => setReplyOpen(false)}
              />
            </div>
          )}
          {editOpen && (
            <div className="pt-6">
              <CommentInput
                originalCharacterId={originalCharacterId}
                originalNoteId={originalNoteId}
                characterId={comment.characterId}
                noteId={comment.noteId}
                onSubmitted={() => setEditOpen(false)}
                comment={comment}
              />
            </div>
          )}
        </div>
      </div>
      {(comment as any)?.fromNotes?.list?.length > 0 && (
        <div className="pl-[57px] space-y-6 pt-6">
          {(comment as any)?.fromNotes?.list?.map(
            (
              subcomment: NoteEntity & {
                character?: CharacterEntity | null
              },
            ) => (
              <CommentItem
                originalCharacterId={originalCharacterId}
                originalNoteId={originalNoteId}
                comment={subcomment}
                key={subcomment.transactionHash}
                depth={depth + 1}
              />
            ),
          )}
        </div>
      )}
    </div>
  )
}
