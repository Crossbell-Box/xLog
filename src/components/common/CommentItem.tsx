import { Avatar } from "~/components/ui/Avatar"
import dayjs, { formatToISO } from "~/lib/date"
import { UniLink } from "~/components/ui/UniLink"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { CSB_SCAN } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { PageContent } from "~/components/common/PageContent"
import { NoteEntity, CharacterEntity } from "crossbell.js"
import { Button } from "~/components/ui/Button"
import { Reactions } from "~/components/common/Reactions"
import { useState } from "react"
import { CommentInput } from "~/components/common/CommentInput"
import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"

export const CommentItem: React.FC<{
  comment: NoteEntity & {
    character?: CharacterEntity | null
  }
  originalId?: string
  depth: number
}> = ({ comment, originalId, depth }) => {
  const [replyOpen, setReplyOpen] = useState(false)

  return (
    <div
      key={comment.transactionHash}
      className={depth > 0 ? "" : "border-b border-dashed pb-6"}
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
        <div className="flex-1 flex flex-col rounded-lg">
          <div className="mb-1 text-sm">
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
            </UniLink>{" "}
            ·{" "}
            <time dateTime={formatToISO(comment?.createdAt)}>
              {dayjs
                .duration(
                  dayjs(comment?.createdAt).diff(dayjs(), "minute"),
                  "minute",
                )
                .humanize()}{" "}
              ago
            </time>{" "}
            ·{" "}
            <UniLink href={`${CSB_SCAN}/tx/${comment.transactionHash}`}>
              <BlockchainIcon className="w-3 h-3 inline-block" />
            </UniLink>
          </div>
          <PageContent
            content={comment.metadata?.content?.content}
          ></PageContent>
          <div className="mt-1 flex items-center">
            <Reactions
              className="inline-flex"
              size="sm"
              pageId={`${comment.characterId}-${comment.noteId}`}
            />
            {depth < 2 && (
              <Button
                className="text-gray-500 text-[13px] ml-2 mt-[-1px]"
                variant="text"
                onClick={() => setReplyOpen(!replyOpen)}
              >
                {replyOpen ? "Cancel " : ""}Reply
                <span className="ml-1">
                  {(comment as any)?.fromNotes?.count || 0}
                </span>
              </Button>
            )}
          </div>
          {replyOpen && (
            <div className="pt-6">
              <CommentInput
                originalId={originalId}
                pageId={`${comment.characterId}-${comment.noteId}`}
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
