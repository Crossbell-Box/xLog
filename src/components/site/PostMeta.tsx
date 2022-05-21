import { formatDate } from "~/lib/date"
import { getUserContentsUrl } from "~/lib/user-contents"
import { Avatar } from "../ui/Avatar"

type Author = {
  id: string
  name: string
  avatar: string | null
}

export const PostAuthors: React.FC<{ authors: Author[] }> = ({ authors }) => {
  return (
    <div className="flex items-center">
      {authors.map((author) => {
        return (
          <span key={author.id} className="flex items-center space-x-2">
            <Avatar
              size={24}
              images={[getUserContentsUrl(author.avatar)]}
              name={author.name}
            />
            <span>{author.name}</span>
          </span>
        )
      })}
    </div>
  )
}

export const PostMeta: React.FC<{
  publishedAt: string
  authors: Author[]
}> = ({ authors, publishedAt }) => {
  return (
    <div className="text-zinc-400 mt-2 flex items-center space-x-5">
      <span>{formatDate(publishedAt)}</span>
      <PostAuthors authors={authors} />
    </div>
  )
}
