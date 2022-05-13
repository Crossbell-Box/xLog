import Link from "next/link"
import { formatDate } from "~/lib/date"

export const SiteArchives: React.FC<{
  posts:
    | { id: string; publishedAt: string; slug: string; title: string }[]
    | undefined
}> = ({ posts }) => {
  if (!posts) return null
  return (
    <>
      <h2 className="text-xl font-bold page-title">Archives</h2>
      <div className="mt-5">
        {posts.map((post) => {
          return (
            <Link key={post.id} href={`/${post.slug}`}>
              <a className="flex justify-between items-center p-1 px-2 rounded-lg -mx-2 hover:bg-zinc-50">
                <span className="text-accent">{post.title}</span>
                <span className="text-zinc-400 mr-3 text-sm whitespace-nowrap">
                  {formatDate(post.publishedAt)}
                </span>
              </a>
            </Link>
          )
        })}
      </div>
    </>
  )
}
