import { Comment } from "~/components/common/Comment"
import { ReactionLike } from "~/components/common/ReactionLike"
import { ReactionMint } from "~/components/common/ReactionMint"
import { ReactionTip } from "~/components/common/ReactionTip"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"

export const PostFooter: React.FC<{
  page?: ExpandedNote
  site?: ExpandedCharacter
}> = ({ page, site }) => {
  return (
    <>
      <div
        className="xlog-reactions flex fill-gray-400 text-gray-500 sm:items-center space-x-6 sm:space-x-10 mt-14 mb-12"
        data-hide-print
      >
        <ReactionLike characterId={page?.characterId} noteId={page?.noteId} />
        <ReactionMint characterId={page?.characterId} noteId={page?.noteId} />
        <ReactionTip
          characterId={page?.characterId}
          noteId={page?.noteId}
          site={site}
          page={page}
        />
      </div>
      <Comment page={page} />
    </>
  )
}
