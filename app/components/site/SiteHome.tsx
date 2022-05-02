import { Link } from "@remix-run/react"
import { formatDate } from "~/lib/date"
import { type PostOnSiteHome } from "~/lib/types"

export const SiteHome: React.FC<{
  posts: PostOnSiteHome[]
}> = ({ posts }) => {
  return (
    <div className="space-y-14">
      {posts?.map((post) => {
        return (
          <div key={post.id} className="block">
            <h3 className="text-2xl font-medium">
              <Link to={`/${post.slug}`} className="hover:text-indigo-500">
                {post.title}
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
