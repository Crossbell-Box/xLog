import Link from "next/link"
import { formatDate } from "~/lib/date"
import { Paginated, type PostOnSiteHome, Notes } from "~/lib/types"
import { EmptyState } from "../ui/EmptyState"

export const SiteHome: React.FC<{
  posts?: Notes
}> = ({ posts }) => {
  if (!posts) return null

  return (
    <div className="">
      {posts.total === 0 && <EmptyState />}
      {posts.total > 0 && (
        <div className="space-y-3" xlog-label="posts">
          {posts.list.map((post) => {
            const excerpt = post.summary?.content
            return (
              <Link key={post.slug} href={`/${post.slug}`}>
                <a
                  className="block hover:bg-zinc-100 transition-colors p-5 -mx-5 first:-mt-5 md:rounded-xl"
                  xlog-label="post"
                >
                  <h3 className="text-2xl font-bold" xlog-label="post-title">
                    {post.title}
                  </h3>
                  <div
                    className="text-sm text-zinc-400 mt-1"
                    xlog-label="post-date"
                  >
                    {formatDate(post.date_published)}
                  </div>
                  <div className="mt-3 text-zinc-500" xlog-label="post-excerpt">
                    {excerpt}
                    {excerpt && "..."}
                  </div>
                </a>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
