import { Comment } from "~/components/common/Comment"
import { ReactionLike } from "~/components/common/ReactionLike"
import { ReactionMint } from "~/components/common/ReactionMint"
import { ReactionTip } from "~/components/common/ReactionTip"
import { Note, Profile } from "~/lib/types"

export const PostFooter: React.FC<{
  page?: Note | null
  site?: Profile | null
}> = ({ page, site }) => {
  return (
    <>
      <div
        className="xlog-reactions flex fill-gray-400 text-gray-500 sm:items-center space-x-6 sm:space-x-10 mt-14 mb-12"
        data-hide-print
      >
        <ReactionLike pageId={page?.id} />
        <ReactionMint pageId={page?.id} />
        <ReactionTip pageId={page?.id} site={site} page={page} />
      </div>
      <Comment page={page} />
    </>
  )
}
