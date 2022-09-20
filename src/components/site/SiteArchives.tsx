import Link from "next/link"
import { useMemo } from "react"
import { formatDate } from "~/lib/date"
import { EmptyState } from "../ui/EmptyState"
import { Notes, Note } from "~/lib/types"

export const SiteArchives: React.FC<{
  posts?: Notes
  title?: string
}> = ({ posts, title }) => {
  const groupedByYear = useMemo<Map<string, Note[]>>(() => {
    const map = new Map()

    if (posts) {
      for (const post of posts.list) {
        const year = formatDate(post.date_published, "YYYY")
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
      <h2 className="text-xl font-bold page-title">{title || "Archives"}</h2>
      {posts.list.length === 0 && (
        <div className="mt-5">
          <EmptyState />
        </div>
      )}
      {posts.list.length > 0 && (
        <div className="mt-5 space-y-5">
          {[...groupedByYear.keys()].map((year) => {
            const posts = groupedByYear.get(year)!
            return (
              <div key={year}>
                <h3 className="text-lg font-bold mb-1 text-zinc-700">{year}</h3>
                {posts.map((post) => {
                  return (
                    <Link key={post.id} href={`/${post.slug || post.id}`}>
                      <a className="flex justify-between items-center p-2 rounded-lg -mx-2 hover:bg-zinc-100">
                        <span className="text-zinc-700">{post.title}</span>
                        <span className="text-zinc-400 mr-3 whitespace-nowrap">
                          {formatDate(post.date_published, "MMM D")}
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
