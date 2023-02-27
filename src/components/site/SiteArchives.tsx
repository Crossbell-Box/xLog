import Link from "next/link"
import { useMemo } from "react"
import { EmptyState } from "../ui/EmptyState"
import { Notes, Note } from "~/lib/types"
import { UniLink } from "../ui/UniLink"
import { Button } from "~/components/ui/Button"
import { useDate } from "~/hooks/useDate"
import { useTranslation } from "next-i18next"

export const SiteArchives: React.FC<{
  title?: string
  showTags?: boolean
  postPages?: Notes[]
  fetchNextPage: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}> = ({
  title,
  showTags,
  postPages,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) => {
  let currentLength = 0
  const date = useDate()
  const { t } = useTranslation(["common", "site"])

  const groupedByYear = useMemo<Map<string, Note[]>>(() => {
    const map = new Map()

    if (postPages?.length) {
      for (const posts of postPages) {
        for (const post of posts.list) {
          const year = date.formatDate(post.date_published, "YYYY")
          const items = map.get(year) || []
          items.push(post)
          map.set(year, items)
        }
      }
    }

    return map
  }, [postPages, date])

  const tags = useMemo<Map<string, number>>(() => {
    const result = new Map()

    if (postPages?.length) {
      for (const posts of postPages) {
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
    }

    return result
  }, [postPages])

  if (!postPages?.length) return null

  return (
    <>
      <h2 className="text-xl font-bold page-title">
        {title || t("Archives", { ns: "site" })}
      </h2>
      {!postPages[0].total && (
        <div className="mt-5">
          <EmptyState />
        </div>
      )}
      {postPages[0].total && (
        <>
          {showTags && tags.size > 0 && (
            <div className="mt-5">
              <h3 className="text-lg font-bold mb-1 text-zinc-700">
                {t("Tags", { ns: "site" })}
              </h3>
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
              currentLength++
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
                        className="flex justify-between items-center p-2 rounded-lg -mx-2 hover:bg-hover"
                      >
                        <span className="text-zinc-700">{post.title}</span>
                        <span className="text-zinc-400 mr-3 whitespace-nowrap">
                          {t("intlDateTime", {
                            val: new Date(post.date_published),
                            formatParams: {
                              val: {
                                month: "short",
                                day: "numeric",
                              },
                            },
                          })}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )
            })}
            {hasNextPage && (
              <Button
                className="mt-8 w-full bg-zinc-50 text-sm"
                variant="text"
                onClick={fetchNextPage}
                isLoading={isFetchingNextPage}
                aria-label="load more"
              >
                There are {postPages[0].total - currentLength} more post
                {postPages[0].total - currentLength > 1 ? "s" : ""}, click to
                load more
              </Button>
            )}
          </div>
        </>
      )}
    </>
  )
}
