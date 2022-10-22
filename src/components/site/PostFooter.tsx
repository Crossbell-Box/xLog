import { Note } from "~/lib/types"
import { Comment } from "~/components/common/Comment"
import { Reactions } from "~/components/common/Reactions"

export const PostFooter: React.FC<{
  page?: Note | null
}> = ({ page }) => {
  return (
    <>
      <Reactions className="mt-14 mb-12" pageId={page?.id} />
      <Comment page={page} />
    </>
  )
}
