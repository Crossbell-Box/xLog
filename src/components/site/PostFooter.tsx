import { Note, Profile } from "~/lib/types"
import { Comment } from "~/components/common/Comment"
import { Reactions } from "~/components/common/Reactions"

export const PostFooter: React.FC<{
  page?: Note | null
  site?: Profile | null
}> = ({ page, site }) => {
  return (
    <>
      <Reactions
        className="mt-14 mb-12"
        pageId={page?.id}
        site={site}
        page={page}
      />
      <Comment page={page} />
    </>
  )
}
