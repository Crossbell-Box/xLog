import Link from "next/link"
import { formatDate } from "~/lib/date"
import { Paginated, type PostOnSiteHome } from "~/lib/types"
import { EmptyState } from "../ui/EmptyState"

export const SiteHome: React.FC<{
  posts?: Paginated<PostOnSiteHome>
}> = ({ posts }) => {
  if (!posts) return null

  return (
    <div className="">
      {posts.total === 0 && <EmptyState />}
      {posts.total > 0 && (
        <div className="space-y-14">
          {posts.nodes.map((post) => {
            const excerpt = post.excerpt || post.autoExcerpt
            return (
              <div key={post.id} className="block">
                <h3 className="text-2xl font-bold">
                  <Link href={`/${post.slug}`}>
                    <a className="hover:text-indigo-500">{post.title}</a>
                  </Link>
                </h3>
                <div className="text-sm text-zinc-400 mt-1">
                  {formatDate(post.publishedAt)}
                </div>
                <div className="mt-3 text-zinc-500">
                  {excerpt}
                  {excerpt && "..."}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
