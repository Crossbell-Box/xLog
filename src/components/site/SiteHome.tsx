import Link from "next/link"
import { formatDate } from "~/lib/date"
import { Paginated, type PostOnSiteHome } from "~/lib/types"

export const SiteHome: React.FC<{
  posts: Paginated<PostOnSiteHome>
}> = ({ posts }) => {
  return (
    <div className="space-y-14">
      {posts.nodes.map((post) => {
        return (
          <div key={post.id} className="block">
            <h3 className="text-2xl font-medium">
              <Link href={`/${post.slug}`}>
                <a className="hover:text-indigo-500">{post.title}</a>
              </Link>
            </h3>
            <div className="text-sm text-zinc-400 mt-1">
              {formatDate(post.publishedAt)}
            </div>
            <div className="mt-3 text-zinc-500">
              {post.excerpt}
              {"..."}
            </div>
          </div>
        )
      })}
    </div>
  )
}
