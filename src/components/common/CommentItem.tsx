"use client"

import { CharacterEntity, NoteEntity } from "crossbell.js"
import { useState } from "react"

import { useAccountState } from "@crossbell/connect-kit"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { CommentInput } from "~/components/common/CommentInput"
import { PageContent } from "~/components/common/PageContent"
import { ReactionLike } from "~/components/common/ReactionLike"
import { Titles } from "~/components/common/Titles"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { Avatar } from "~/components/ui/Avatar"
import { Button } from "~/components/ui/Button"
import { UniLink } from "~/components/ui/UniLink"
import { useDate } from "~/hooks/useDate"
import { CSB_SCAN } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { useTranslation } from "~/lib/i18n/client"
import { cn } from "~/lib/utils"

export const CommentItem: React.FC<{
  comment: NoteEntity & {
    character?: CharacterEntity | null
  }
  originalCharacterId?: number
  originalNoteId?: number
  depth: number
  className?: string
}> = ({ comment, originalCharacterId, originalNoteId, depth, className }) => {
  const [replyOpen, setReplyOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const { t } = useTranslation("common")
  const date = useDate()

  const account = useAccountState(({ computed }) => computed.account)

  if (!comment.metadata?.content?.content) {
    return null
  }

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
                  comment?.character?.handle &&
                  getSiteLink({
                    subdomain: comment.character.handle,
                  })
                }
                className="block align-middle mr-3"
              >
                <Avatar
                  images={comment?.character?.metadata?.content?.avatars || []}
                  name={comment?.character?.metadata?.content?.name}
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
                comment?.character?.handle &&
                getSiteLink({
                  subdomain: comment.character.handle,
                })
              }
              className="font-medium text-accent"
            >
              {comment?.character?.metadata?.content?.name}
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
          <PageContent
            content={comment.metadata?.content?.content}
            isComment={true}
          ></PageContent>
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
                className="text-gray-500 text-[13px] ml-1 mt-[-1px]"
                variant="text"
                onClick={() => setReplyOpen(!replyOpen)}
              >
                {t(`${replyOpen ? "Cancel " : ""}Reply`)}
                <span className="ml-1">
                  {(comment as any)?.fromNotes?.count || 0}
                </span>
              </Button>
            )}
            {comment.characterId === account?.characterId && (
              <Button
                className="text-gray-500 text-[13px] mt-[-1px]"
                variant="text"
                onClick={() => setEditOpen(!editOpen)}
              >
                <i className="icon-[mingcute--edit-line] mx-1" />{" "}
                {t(`${editOpen ? "Cancel " : ""}Edit`)}
              </Button>
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
