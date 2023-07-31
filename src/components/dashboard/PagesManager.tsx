"use client"

import { nanoid } from "nanoid"
import Link from "next/link"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { Fragment, useMemo, useState } from "react"

import { Menu } from "@headlessui/react"
import { useQueryClient } from "@tanstack/react-query"

import PostCover from "~/components/home/PostCover"
import { useDate } from "~/hooks/useDate"
import { Trans, useTranslation } from "~/lib/i18n/client"
import { getPageVisibility } from "~/lib/page-helpers"
import { readFiles } from "~/lib/read-files"
import { setStorage } from "~/lib/storage"
import { ExpandedNote, PageVisibilityEnum } from "~/lib/types"
import { cn } from "~/lib/utils"
import { useGetPagesBySite, usePinnedPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

import { Button } from "../ui/Button"
import { EmptyState } from "../ui/EmptyState"
import { TabItem, Tabs } from "../ui/Tabs"
import { Tooltip } from "../ui/Tooltip"
import { UniLink } from "../ui/UniLink"
import { DashboardMain } from "./DashboardMain"
import { PagesManagerBatchSelectActionTab } from "./PagesManagerBatchSelectActionTab"
import { PagesManagerMenu } from "./PagesManagerMenu"

export const PagesManager = ({ isPost }: { isPost: boolean }) => {
  const params = useParams()
  const subdomain = params?.subdomain as string
  const site = useGetSite(subdomain)
  const searchParams = useSearchParams()!
  const router = useRouter()
  const pathname = usePathname()
  const pinnedPage = usePinnedPage({ characterId: site.data?.characterId })

  const visibility = useMemo<PageVisibilityEnum>(
    () =>
      searchParams?.get("visibility")
        ? (searchParams?.get("visibility") as PageVisibilityEnum)
        : PageVisibilityEnum.All,
    [searchParams],
  )

  const { t, i18n } = useTranslation("dashboard")
  const { t: siteT } = useTranslation("site")
  const date = useDate()

  const pages = useGetPagesBySite({
    type: isPost ? "post" : "page",
    characterId: site.data?.characterId,
    limit: 20,
    visibility,
    handle: subdomain,
    useStat: true,
  })

  // Batch selections
  const [batchSelected, setBatchSelected] = useState<(string | number)[]>([])

  const tabItems: TabItem[] = [
    {
      value: PageVisibilityEnum.All,
      text: `All ${isPost ? "Posts" : "Pages"}`,
    },
    {
      value: PageVisibilityEnum.Published,
      text: "Published",
    },
    {
      value: PageVisibilityEnum.Draft,
      text: "Draft",
    },
    {
      value: PageVisibilityEnum.Scheduled,
      text: "Scheduled",
    },
  ].map((item) => ({
    text: item.text,
    onClick: () => {
      // issue related: https://github.com/vercel/next.js/issues/49245
      const newQuery = new URLSearchParams(searchParams.toString())
      newQuery.set("visibility", item.value)
      if (item.value === PageVisibilityEnum.All) {
        newQuery.delete("visibility")
      }
      const search = newQuery.toString()
      router.push(pathname + "?" + search)
    },
    active: item.value === visibility,
  }))

  const getPageEditLink = (page: ExpandedNote) => {
    return `/dashboard/${subdomain}/editor?id=${
      page.noteId || page.draftKey
    }&type=${isPost ? "post" : "page"}`
  }

  const queryClient = useQueryClient()

  const importFile = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".md"
    input.addEventListener("change", async (e: any) => {
      const file = (await readFiles(e.target?.files))?.[0]
      if (file) {
        const id = nanoid()
        const key = `draft-${site.data?.characterId}-!local-${id}`
        setStorage(key, {
          date: +new Date(),
          values: {
            content: file.content,
            published: false,
            publishedAt: file.date_published,
            slug: file.slug,
            tags: file.tags?.join?.(", "),
            title: file.title,
          },
          isPost: isPost,
        })
        queryClient.invalidateQueries([
          "getPagesBySite",
          site.data?.characterId,
        ])
        router.push(
          `/dashboard/${subdomain}/editor?id=!local-${id}&type=${
            isPost ? "post" : "page"
          }`,
        )
      }
    })
    input.click()
  }

  const title = isPost ? "Posts" : "Pages"
  const description = isPost ? (
    <>
      <p>
        <Trans i18n={i18n} i18nKey="posts description" ns="dashboard">
          Posts are entries listed in reverse chronological order on your site.
          Think of them as articles or updates that you share to offer up new
          content to your readers.{" "}
          <UniLink className="underline" href={t("link post-vs-page") || ""}>
            Post vs. Page
          </UniLink>
        </Trans>
      </p>
    </>
  ) : (
    <>
      <p>
        <Trans i18n={i18n} i18nKey="pages description" ns="dashboard">
          Pages are static and are not affected by date. Think of them as more
          permanent fixtures of your site — an About page, and a Contact page
          are great examples of this.{" "}
          <UniLink
            className="underline"
            href="https://wordpress.com/support/post-vs-page/"
          >
            Post vs. Page
          </UniLink>
        </Trans>
      </p>
      <p>
        <Trans i18n={i18n} i18nKey="pages add" ns="dashboard">
          After you create a page, you can{" "}
          <UniLink
            className="underline"
            href={`/dashboard/${subdomain}/settings/navigation`}
          >
            add it to your site&apos;s navigation menu
          </UniLink>{" "}
          so your visitors can find it.
        </Trans>
      </p>
    </>
  )

  let currentLength = 0

  return (
    <DashboardMain className="max-w-screen-lg">
      <header className="mb-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t(title)}</h2>
        </div>
        <div className="space-x-4">
          <Button
            className={cn(`space-x-2 inline-flex`)}
            onClick={() =>
              router.push(
                `/dashboard/${subdomain}/editor?type=${
                  isPost ? "post" : "page"
                }`,
              )
            }
          >
            <span className="icon-[mingcute--add-line] inline-block"></span>
            <span>{t(`New ${isPost ? "Post" : "Page"}`)}</span>
          </Button>
          <span className="hidden sm:inline-flex">
            <Tooltip
              label={t("Import markdown file with front matter supported")}
              placement="bottom"
            >
              <Button className={cn(`space-x-2`)} onClick={importFile}>
                <span className="icon-[mingcute--file-import-line] inline-block"></span>
                <span>{t("Import")}</span>
              </Button>
            </Tooltip>
          </span>
        </div>
        <div className="text-sm text-zinc-500 leading-relaxed">
          {description}
        </div>
      </header>

      {batchSelected.length > 0 ? (
        <PagesManagerBatchSelectActionTab
          isPost={isPost}
          pages={pages.data}
          batchSelected={batchSelected}
          setBatchSelected={setBatchSelected}
        />
      ) : (
        <Tabs items={tabItems} />
      )}

      <div className="-mt-3">
        {pages.isLoading && <p className="py-4 px-3">{t("Loading")}...</p>}
        {!pages.isLoading && !pages.data?.pages?.[0].count && (
          <EmptyState resource={isPost ? "posts" : "pages"} />
        )}

        {pages.data?.pages.map(
          (page) =>
            page.list?.map((page) => {
              currentLength++
              return (
                <Link
                  key={page.transactionHash || page.draftKey}
                  href={getPageEditLink(page)}
                  className="group relative hover:bg-zinc-100 rounded-lg py-4 px-3 transition-colors -mx-3 flex space-x-4"
                >
                  <PostCover
                    uniqueKey={`${page.characterId}-${page.noteId}`}
                    images={page.metadata?.content.images}
                    title={page.metadata?.content?.title}
                    className="rounded-lg w-48"
                  />
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div className="xlog-post-title font-bold text-base text-zinc-700">
                      <span>{page.metadata?.content?.title}</span>
                    </div>
                    <div
                      className="xlog-post-excerpt text-zinc-500 line-clamp-1 text-sm"
                      style={{
                        wordBreak: "break-word",
                      }}
                    >
                      {page.metadata?.content?.summary}
                      {page.metadata?.content?.summary && "..."}
                    </div>
                    <div className="xlog-post-meta text-zinc-400 flex items-center text-[13px] h-[26px] truncate">
                      {!!page.metadata?.content?.tags?.[1] && (
                        <span className="xlog-post-tags border transition-colors text-zinc-500 inline-flex items-center bg-zinc-100 rounded-full px-2 py-[1.5px] truncate text-xs sm:text-[13px] mr-2">
                          <i className="icon-[mingcute--tag-line] mr-[2px]" />
                          {page.metadata?.content?.tags?.[1]}
                        </span>
                      )}
                      <span className="xlog-post-word-count sm:inline-flex items-center hidden mr-2">
                        <i className="icon-[mingcute--time-line] mr-[2px]" />
                        <span
                          style={{
                            wordSpacing: "-.2ch",
                          }}
                        >
                          {page.metadata?.content?.readingTime} {t("min")}
                        </span>
                      </span>
                      {!!page.stat?.viewDetailCount && (
                        <span className="xlog-post-views inline-flex items-center">
                          <i className="icon-[mingcute--eye-line] mr-[2px]" />
                          <span>{page.stat?.viewDetailCount}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-400 text-sm">
                      <span className="capitalize">
                        {t(getPageVisibility(page))}
                      </span>
                      <span className="mx-2">·</span>
                      <span>
                        {getPageVisibility(page) === PageVisibilityEnum.Draft
                          ? date.formatDate(page.updatedAt)
                          : date.formatDate(
                              page.metadata?.content?.date_published || "",
                            )}
                      </span>
                      {pinnedPage.noteId === page.noteId && (
                        <>
                          <span className="mx-2">·</span>
                          <span>
                            <i className="icon-[mingcute--pin-2-fill] translate-y-[18%]" />{" "}
                            {siteT("Pinned")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex self-center">
                    <button
                      className={cn(
                        `text-gray-400 relative z-10 w-8 h-8 rounded inline-flex group-hover:visible justify-center items-center`,
                        batchSelected.includes(
                          page.noteId || page.draftKey || 0,
                        )
                          ? "bg-gray-200"
                          : `hover:bg-gray-200`,
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        // Toggle selection
                        if (
                          batchSelected.includes(
                            page.noteId || page.draftKey || 0,
                          )
                        ) {
                          // Deselect
                          setBatchSelected(
                            batchSelected.filter(
                              (pageId) =>
                                pageId !== page.noteId || page.draftKey || 0,
                            ),
                          )
                        } else {
                          // Do select
                          setBatchSelected([
                            ...batchSelected,
                            page.noteId || page.draftKey || 0,
                          ])
                        }
                      }}
                    >
                      <i
                        className={`${
                          batchSelected.includes(
                            page.noteId || page.draftKey || 0,
                          )
                            ? "icon-[mingcute--check-fill]"
                            : "icon-[mingcute--add-line]"
                        } text-lg`}
                      />
                    </button>
                  </div>
                  <div className="w-10 flex-shrink-0 flex self-center ml-auto">
                    <Menu>
                      {({ open, close }) => (
                        <>
                          <Menu.Button as={Fragment}>
                            <button
                              className={cn(
                                `text-gray-400 relative z-10 w-8 h-8 rounded inline-flex group-hover:visible justify-center items-center`,
                                open ? `bg-gray-200` : `hover:bg-gray-200`,
                              )}
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              <i className="icon-[mingcute--more-1-line] text-2xl" />
                            </button>
                          </Menu.Button>

                          <PagesManagerMenu
                            isPost={isPost}
                            page={page}
                            onClick={close}
                          />
                        </>
                      )}
                    </Menu>
                  </div>
                </Link>
              )
            }),
        )}

        {pages.hasNextPage && (
          <Button
            className="w-full bg-zinc-50 rounded-lg mt-4"
            variant="text"
            onClick={pages.fetchNextPage as () => void}
            isLoading={pages.isFetchingNextPage}
          >
            {siteT("load more", {
              name: t(
                isPost
                  ? "post"
                  : "page" +
                      ((pages.data?.pages?.[0].count || 0) - currentLength > 1
                        ? "s"
                        : ""),
              ),
              count: (pages.data?.pages?.[0].count || 0) - currentLength,
            })}
          </Button>
        )}
      </div>
    </DashboardMain>
  )
}
