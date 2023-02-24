import Link from "next/link"
import { useDate } from "~/hooks/useDate"
import { Notes } from "~/lib/types"
import { EmptyState } from "../ui/EmptyState"
import { useRouter } from "next/router"
import { Image } from "~/components/ui/Image"
import { Button } from "~/components/ui/Button"
import { EyeIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"

export const SiteHome: React.FC<{
  postPages?: Notes[]
  fetchNextPage: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
}> = ({ postPages, fetchNextPage, hasNextPage, isFetchingNextPage }) => {
  const router = useRouter()
  const { t } = useTranslation(["common", "site"])
  const date = useDate()

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!postPages?.length) return null

  let currentLength = 0

  return (
    <>
      {!postPages[0].total && <EmptyState />}
      {!!postPages[0].total && (
        <div className="xlog-posts space-y-8">
          {postPages.map((posts) =>
            posts.list.map((post) => {
              currentLength++
              return (
                <Link
                  key={post.id}
                  href={`/${post.slug || post.id}`}
                  className="xlog-post sm:hover:bg-hover bg-white transition-all px-5 py-7 -mx-5 first:-mt-5 sm:rounded-xl flex flex-col sm:flex-row items-center"
                >
                  <div className="flex-1 flex justify-center flex-col w-full min-w-0">
                    <h3 className="xlog-post-title text-2xl font-bold">
                      {post.title}
                    </h3>
                    <div className="xlog-post-meta text-sm text-zinc-400 mt-1 space-x-4 flex items-center mr-8">
                      <time
                        dateTime={date.formatToISO(post.date_published)}
                        className="xlog-post-date whitespace-nowrap"
                      >
                        {date.formatDate(
                          post.date_published,
                          undefined,
                          isMounted ? undefined : "America/Los_Angeles",
                        )}
                      </time>
                      {!!post.tags?.filter(
                        (tag) => tag !== "post" && tag !== "page",
                      ).length && (
                        <span className="xlog-post-tags space-x-1 truncate min-w-0">
                          {post.tags
                            ?.filter((tag) => tag !== "post" && tag !== "page")
                            .map((tag) => (
                              <span
                                className="hover:text-zinc-600"
                                key={tag}
                                onClick={(e) => {
                                  e.preventDefault()
                                  router.push(`/tag/${tag}`)
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                        </span>
                      )}
                      <span className="xlog-post-views inline-flex items-center">
                        <EyeIcon className="w-4 h-4 inline-block mr-[2px]" />
                        <span>{post.views}</span>
                      </span>
                    </div>
                    <div
                      className="xlog-post-excerpt mt-3 text-zinc-500 line-clamp-2"
                      style={{
                        wordBreak: "break-word",
                      }}
                    >
                      {post.summary?.content}
                      {post.summary?.content && "..."}
                    </div>
                  </div>
                  {post.cover && (
                    <div className="xlog-post-cover flex items-center relative w-full sm:w-24 h-40 sm:h-24 mt-2 sm:ml-4 sm:mt-0">
                      <Image
                        className="object-cover rounded"
                        alt="cover"
                        fill={true}
                        src={post.cover}
                      ></Image>
                    </div>
                  )}
                </Link>
              )
            }),
          )}
        </div>
      )}
      {hasNextPage && (
        <Button
          className="mt-8 w-full hover:bg-hover bg-zinc-50 transition-colors text-sm"
          variant="text"
          onClick={fetchNextPage}
          isLoading={isFetchingNextPage}
          aria-label="load more"
        >
          {t("load more", {
            ns: "site",
            name: t(
              "post" + (postPages[0].total - currentLength > 1 ? "s" : ""),
            ),
            count: postPages[0].total - currentLength,
          })}
        </Button>
      )}
    </>
  )
}
