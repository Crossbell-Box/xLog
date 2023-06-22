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

import { useDate } from "~/hooks/useDate"
import { Trans, useTranslation } from "~/lib/i18n/client"
import { getPageVisibility } from "~/lib/page-helpers"
import { readFiles } from "~/lib/read-files"
import { setStorage } from "~/lib/storage"
import { ExpandedNote, PageVisibilityEnum } from "~/lib/types"
import { cn } from "~/lib/utils"
import { useGetPagesBySite } from "~/queries/page"
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
        const key = `draft-${site.data?.characterId}-local-${id}`
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
          `/dashboard/${subdomain}/editor?id=local-${id}&type=${
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
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t(title)}</h2>
          <div className="flex justify-center items-center space-x-4">
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
        {pages.isLoading && <p className="py-3 px-3">{t("Loading")}...</p>}
        {!pages.isLoading && !pages.data?.pages?.[0].count && (
          <EmptyState resource={isPost ? "posts" : "pages"} />
        )}

        {pages.data?.pages.map((page) =>
          page.list?.map((page) => {
            currentLength++
            return (
              <Link
                key={page.transactionHash || page.draftKey}
                href={getPageEditLink(page)}
                className="group relative hover:bg-zinc-100 rounded-lg py-3 px-3 transition-colors -mx-3 flex"
              >
                <div className="w-10 flex-shrink-0 flex self-center">
                  <button
                    className={cn(
                      `text-gray-400 relative z-10 w-8 h-8 rounded inline-flex group-hover:visible justify-center items-center`,
                      batchSelected.includes(page.noteId || page.draftKey || 0)
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
                          ? "icon-[mingcute--check-line]"
                          : isPost
                          ? "icon-[mingcute--news-line]"
                          : "icon-[mingcute--file-line]"
                      } text-2xl`}
                    />
                  </button>
                </div>
                <div className="min-w-0">
                  {page.metadata?.content?.title ? (
                    <div className="flex items-center">
                      <span>{page.metadata?.content?.title}</span>
                    </div>
                  ) : (
                    <div className="text-zinc-500 text-xs mt-1 truncate">
                      <span>{page.metadata?.content?.summary}</span>
                    </div>
                  )}
                  <div className="text-zinc-400 text-xs mt-1">
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
                  </div>
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
