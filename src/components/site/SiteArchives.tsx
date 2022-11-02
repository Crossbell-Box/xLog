import Link from "next/link"
import { useMemo } from "react"
import { formatDate } from "~/lib/date"
import { EmptyState } from "../ui/EmptyState"
import { Notes, Note } from "~/lib/types"
import { UniLink } from "../ui/UniLink"

export const SiteArchives: React.FC<{
  posts?: Notes
  title?: string
  showTags?: boolean
}> = ({ posts, title, showTags }) => {
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

  const tags = useMemo<Map<string, number>>(() => {
    const result = new Map()

    if (posts) {
      for (const post of posts.list) {
        post.tags?.forEach((tag) => {
          if (tag !== "post" && tag !== "page") {
            if (result.has(tag)) {
              result.set(tag, result.get(tag) + 1)
            } else {
              result.set(tag, 1)
            }
          }
        })
      }
    }

    return result
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
        <>
          {showTags && tags.size > 0 && (
            <div className="mt-5">
              <h3 className="text-lg font-bold mb-1 text-zinc-700">Tags</h3>
              <div className="pt-2">
                {[...tags.keys()].map((tag) => (
                  <UniLink key={tag} href={`/tag/${tag}`} className="mr-6">
                    <span className="align-middle">{tag}</span>
                    <span className="text-gray-400 text-sm ml-1 align-middle">
                      ({tags.get(tag)})
                    </span>
                  </UniLink>
                ))}
              </div>
            </div>
          )}
          <div className="mt-5 space-y-5">
            {[...groupedByYear.keys()].map((year) => {
              const posts = groupedByYear.get(year)!
              return (
                <div key={year}>
                  <h3 className="text-lg font-bold mb-1 text-zinc-700">
                    {year}
                  </h3>
                  {posts.map((post) => {
                    return (
                      <Link
                        key={post.id}
                        href={`/${post.slug || post.id}`}
                        className="flex justify-between items-center p-2 rounded-lg -mx-2 hover:bg-zinc-100"
                      >
                        <span className="text-zinc-700">{post.title}</span>
                        <span className="text-zinc-400 mr-3 whitespace-nowrap">
                          {formatDate(post.date_published, "MMM D")}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
