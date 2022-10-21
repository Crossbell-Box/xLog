import { Avatar } from "~/components/ui/Avatar"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"
import { UniLink } from "~/components/ui/UniLink"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { CSB_SCAN } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { PageContent } from "~/components/common/PageContent"
import { NoteEntity, CharacterEntity } from "crossbell.js"

dayjs.extend(duration)
dayjs.extend(relativeTime)

export const CommentItem: React.FC<{
  comment: NoteEntity & {
    character?: CharacterEntity | null
  }
  isSub?: boolean
}> = ({ comment, isSub }) => {
  return (
    <div
      key={comment.transactionHash}
      className={isSub ? "" : "border-b border-dashed pb-6"}
    >
      <div className="flex">
        <UniLink
          href={
            comment?.character?.handle &&
            getSiteLink({
              subdomain: comment.character.handle,
            })
          }
          className="align-middle mr-3"
        >
          <Avatar
            images={comment?.character?.metadata?.content?.avatars || []}
            name={comment?.character?.metadata?.content?.name}
            size={45}
          />
        </UniLink>
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
            {dayjs
              .duration(
                dayjs(comment?.createdAt).diff(dayjs(), "minute"),
                "minute",
              )
              .humanize()}{" "}
            ago ·{" "}
            <UniLink href={`${CSB_SCAN}/tx/${comment.transactionHash}`}>
              <BlockchainIcon className="w-3 h-3 inline-block" />
            </UniLink>
          </div>
          <PageContent
            content={comment.metadata?.content?.content}
          ></PageContent>
        </div>
      </div>
      {(comment as any)?.fromNotes?.list?.length > 0 && (
        <div className="pl-11 space-y-6 pt-6">
          {(comment as any)?.fromNotes?.list?.map(
            (
              subcomment: NoteEntity & {
                character?: CharacterEntity | null
              },
            ) => (
              <CommentItem
                comment={subcomment}
                key={subcomment.transactionHash}
                isSub={true}
              />
            ),
          )}
        </div>
      )}
    </div>
  )
}
