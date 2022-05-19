import Link from "next/link"
import { useMemo } from "react"
import { formatDate } from "~/lib/date"
import { EmptyState } from "../ui/EmptyState"

type Post = { id: string; publishedAt: string; slug: string; title: string }

export const SiteArchives: React.FC<{
  posts: Post[] | undefined
}> = ({ posts }) => {
  const groupedByYear = useMemo<Map<string, Post[]>>(() => {
    const map = new Map()

    if (posts) {
      for (const post of posts) {
        const year = formatDate(post.publishedAt, "YYYY")
        const items = map.get(year) || []
        items.push(post)
        map.set(year, items)
      }
    }

    return map
  }, [posts])

  if (!posts) return null

  return (
    <>
      <h2 className="text-xl font-bold page-title">Archives</h2>
      {posts.length === 0 && (
        <div className="mt-5">
          <EmptyState />
        </div>
      )}
      {posts.length > 0 && (
        <div className="mt-5 space-y-5">
          {[...groupedByYear.keys()].map((year) => {
            const posts = groupedByYear.get(year)!
            return (
              <div key={year}>
                <h3 className="text-lg font-bold mb-1 text-zinc-700">{year}</h3>
                {posts.map((post) => {
                  return (
                    <Link key={post.id} href={`/${post.slug}`}>
                      <a className="flex justify-between items-center p-1 px-2 rounded-lg -mx-2 hover:bg-zinc-50">
                        <span className="text-accent font-medium">
                          {post.title}
                        </span>
                        <span className="text-zinc-400 mr-3 font-medium whitespace-nowrap">
                          {formatDate(post.publishedAt, "MMM D")}
                        </span>
                      </a>
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
