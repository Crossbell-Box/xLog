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
            <div key={post.id} className="flex">
              <span className="text-zinc-400 mr-3">
                {formatDate(post.publishedAt)}
              </span>
              <Link href={`/${post.slug}`}>
                <a className="flex text-accent hover:underline">{post.title}</a>
              </Link>
            </div>
          )
        })}
      </div>
    </>
  )
}
