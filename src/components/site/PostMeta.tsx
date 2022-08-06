import { formatDate } from "~/lib/date"

export const PostMeta: React.FC<{
  publishedAt: string
}> = ({ publishedAt }) => {
  return (
    <div className="text-zinc-400 mt-2 flex items-center space-x-5">
      <span>{formatDate(publishedAt)}</span>
    </div>
  )
}
