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
        <div className="xlog-posts space-y-3">
          {posts.list.map((post) => {
            const excerpt = post.summary?.content
            return (
              <Link key={post.id} href={`/${post.slug || post.id}`}>
                <a className="xlog-post hover:bg-zinc-100 transition-colors p-5 -mx-5 first:-mt-5 md:rounded-xl flex">
                  <div className="flex-1 flex justify-center flex-col">
                    <h3 className="xlog-post-title text-2xl font-bold">
                      {post.title}
                    </h3>
                    <div className="xlog-post-date text-sm text-zinc-400 mt-1">
                      {formatDate(post.date_published)}
                    </div>
                    <div
                      className="xlog-post-excerpt mt-3 text-zinc-500"
                      style={{
                        wordBreak: "break-word",
                      }}
                    >
                      {excerpt}
                      {excerpt && "..."}
                    </div>
                  </div>
                  <div className="xlog-post-cover flex items-center">
                    {post.cover && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        className="object-cover w-24 h-24 rounded ml-4"
                        alt="cover"
                        src={post.cover}
                      ></img>
                    )}
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
