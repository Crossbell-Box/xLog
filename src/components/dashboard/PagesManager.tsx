import { Fragment, useEffect, useMemo, useState } from "react"
import { getPageVisibility } from "~/lib/page-helpers"
import { formatDate } from "~/lib/date"
import { TabItem, Tabs } from "../ui/Tabs"
import { Menu } from "@headlessui/react"
import clsx from "clsx"
import { PageVisibilityEnum } from "~/lib/types"
import { DashboardMain } from "./DashboardMain"
import { useRouter } from "next/router"
import Link from "next/link"
import toast from "react-hot-toast"
import { EmptyState } from "../ui/EmptyState"
import type { Note } from "unidata.js"
import {
  useGetPagesBySite,
  useDeletePage,
  useCreateOrUpdatePage,
} from "~/queries/page"
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid"
import { delStorage, getStorage, setStorage } from "~/lib/storage"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "../ui/Button"
import { UniLink } from "../ui/UniLink"
import { nanoid } from "nanoid"
import { renderPageContent } from "~/markdown"
import { Tooltip } from "../ui/Tooltip"
import { APP_NAME } from "~/lib/env"

export const PagesManager: React.FC<{
  isPost: boolean
}> = ({ isPost }) => {
  const router = useRouter()
  const subdomain = router.query.subdomain as string

  const visibility = useMemo<PageVisibilityEnum>(
    () =>
      router.query.visibility
        ? (router.query.visibility as PageVisibilityEnum)
        : PageVisibilityEnum.All,
    [router.query.visibility],
  )

  const deletePage = useDeletePage()
  const createOrUpdatePage = useCreateOrUpdatePage()
  const [convertToastId, setConvertToastId] = useState("")
  const [deleteToastId, setDeleteToastId] = useState("")

  useEffect(() => {
    if (deletePage.isSuccess) {
      toast.success("Deleted!", {
        id: deleteToastId,
      })
    }
  }, [deletePage.isSuccess, deleteToastId])

  useEffect(() => {
    if (createOrUpdatePage.isSuccess) {
      toast.success("Converted!", {
        id: convertToastId,
      })
    } else if (createOrUpdatePage.isError) {
      toast.error("Failed to convert.", {
        id: convertToastId,
      })
    }
  }, [createOrUpdatePage.isSuccess, createOrUpdatePage.isError, convertToastId])

  const pages = useGetPagesBySite({
    type: isPost ? "post" : "page",
    site: subdomain!,
    take: 100,
    visibility,
  })

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
    {
      value: PageVisibilityEnum.Crossbell,
      text: "Others on Crossbell",
    },
  ].map((item) => ({
    text: item.text,
    onClick: () => {
      const newQuery: Record<string, any> = {
        ...router.query,
        visibility: item.value,
      }
      if (item.value === PageVisibilityEnum.All) {
        delete newQuery["visibility"]
      }
      const search = new URLSearchParams(newQuery).toString()
      router.push({
        search,
      })
    },
    active: item.value === visibility,
  }))

  const getPageEditLink = (page: { id: string }) => {
    return `/dashboard/${subdomain}/editor?id=${page.id}&type=${
      isPost ? "post" : "page"
    }`
  }

  const queryClient = useQueryClient()
  const getPageMenuItems = (page: Note) => {
    const isCrossbell = !page.applications?.includes("xlog")
    return [
      {
        text: "Edit",
        icon: (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        ),
        onClick() {
          router.push(getPageEditLink(page))
        },
      },
      {
        text:
          "Convert to " +
          (isCrossbell
            ? `${APP_NAME} ${isPost ? "Post" : "Page"}`
            : isPost
            ? "Page"
            : "Post"),
        icon: <span className="i-tabler:transform inline-block"></span>,
        onClick() {
          const toastId = toast.loading("Converting...")
          if (isCrossbell) {
            setConvertToastId(toastId)
            createOrUpdatePage.mutate({
              published: true,
              pageId: page.id,
              siteId: subdomain,
              tags: page.tags
                ?.filter((tag) => tag !== "post" && tag !== "page")
                ?.join(", "),
              isPost: isPost,
              applications: page.applications,
            })
          } else {
            if (!page.metadata) {
              const data = getStorage(`draft-${subdomain}-${page.id}`)
              data.isPost = !isPost
              setStorage(`draft-${subdomain}-${page.id}`, data)
              queryClient.invalidateQueries(["getPagesBySite", subdomain])
              queryClient.invalidateQueries(["getPage", page.id])
              toast.success("Converted!", {
                id: toastId,
              })
            } else {
              setConvertToastId(toastId)
              createOrUpdatePage.mutate({
                published: true,
                pageId: page.id,
                siteId: subdomain,
                tags: page.tags
                  ?.filter((tag) => tag !== "post" && tag !== "page")
                  ?.join(", "),
                isPost: !isPost,
                applications: page.applications,
              })
            }
          }
        },
      },
      {
        text: "Delete",
        icon: (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        ),
        onClick() {
          if (!page.metadata) {
            const toastId = toast.loading("Deleting...")
            delStorage(`draft-${subdomain}-${page.id}`)
            queryClient.invalidateQueries(["getPagesBySite", subdomain])
            queryClient.invalidateQueries(["getPage", page.id])
            toast.success("Deleted!", {
              id: toastId,
            })
          } else {
            setDeleteToastId(toast.loading("Deleting..."))
            deletePage.mutate({
              site: subdomain,
              id: page.id,
            })
          }
        },
      },
    ]
  }

  const importFile = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".md"
    input.addEventListener("change", async (e: any) => {
      const file = e.target?.files?.[0]
      const reader = new FileReader()
      reader.readAsText(file, "UTF-8")
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const pageContent = renderPageContent(evt.target.result as string)

          const id = nanoid()
          const key = `draft-${subdomain}-local-${id}`
          const tags =
            pageContent.frontMatter.tags || pageContent.frontMatter.categories
          setStorage(key, {
            date: +new Date(),
            values: {
              content: evt.target.result,
              published: false,
              publishedAt: (
                pageContent.frontMatter.date ||
                file.lastModifiedDate ||
                new Date()
              ).toISOString(),
              slug:
                pageContent.frontMatter.permalink ||
                file.name.split(".").slice(0, -1).join("."),
              tags: tags?.join?.(", ") || tags,
              title: pageContent.frontMatter.title,
            },
            isPost: isPost,
          })
          queryClient.invalidateQueries(["getPagesBySite", subdomain])
          router.push(
            `/dashboard/${subdomain}/editor?id=local-${id}&type=${
              isPost ? "post" : "page"
            }`,
          )
        }
      }
      reader.onerror = (evt) => {
        toast.error("Error reading file")
      }
    })
    input.click()
  }

  const title = isPost ? "Posts" : "Pages"
  const description = isPost ? (
    <>
      <p>
        <UniLink
          className="underline"
          href="https://wordpress.com/support/post-vs-page/"
        >
          Post vs. Page
        </UniLink>
        . Posts are entries listed in reverse chronological order on your site.
        Think of them as articles or updates that you share to offer up new
        content to your readers.
      </p>
    </>
  ) : (
    <>
      <p>
        <UniLink
          className="underline"
          href="https://wordpress.com/support/post-vs-page/"
        >
          Post vs. Page
        </UniLink>
        . Pages are static and are not affected by date. Think of them as more
        permanent fixtures of your site — an About page, and a Contact page are
        great examples of this.
      </p>
      <p>
        After you create a page, you can{" "}
        <UniLink
          className="underline"
          href={`/dashboard/${subdomain}/settings/navigation`}
        >
          add it to your site&apos;s navigation menu
        </UniLink>{" "}
        so your visitors can find it.
      </p>
    </>
  )

  let currentLength = 0

  return (
    <DashboardMain>
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="flex justify-center items-center">
            <Button
              className={clsx(`space-x-2 inline-flex mr-4`)}
              onClick={() =>
                router.push(
                  `/dashboard/${subdomain}/editor?type=${
                    isPost ? "post" : "page"
                  }`,
                )
              }
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              <span>New {isPost ? "Post" : "Page"}</span>
            </Button>
            <Tooltip
              label="Import markdown file with front matter supported"
              placement="bottom"
            >
              <Button
                className={clsx(`space-x-2 inline-flex`)}
                onClick={importFile}
              >
                <span className="i-bxs:duplicate inline-block"></span>
                <span>Import</span>
              </Button>
            </Tooltip>
          </div>
        </div>
        <div className="text-sm text-zinc-500 leading-relaxed">
          {description}
        </div>
      </header>
      <Tabs items={tabItems} />

      <div className="-mt-3">
        {!pages.data?.pages?.[0].total && (
          <EmptyState resource={isPost ? "posts" : "pages"} />
        )}

        {pages.data?.pages.map((page) =>
          page.list?.map((page) => {
            currentLength++
            return (
              <Link
                key={page.id}
                href={getPageEditLink(page)}
                className="group relative hover:bg-zinc-100 rounded-lg py-3 px-3 transition-colors -mx-3 flex justify-between"
              >
                <div className="min-w-0">
                  {page.title ? (
                    <div className="flex items-center">
                      <span>{page.title}</span>
                    </div>
                  ) : (
                    <div className="text-zinc-500 text-xs mt-1 truncate">
                      <span>{page.summary?.content}</span>
                    </div>
                  )}
                  <div className="text-zinc-400 text-xs mt-1">
                    <span className="capitalize">
                      {getPageVisibility(page).toLowerCase()}
                    </span>
                    <span className="mx-2">·</span>
                    <span>
                      {getPageVisibility(page) === PageVisibilityEnum.Draft
                        ? formatDate(page.date_updated)
                        : formatDate(page.date_published)}
                    </span>
                  </div>
                </div>
                <div className="w-10 flex-shrink-0">
                  <Menu>
                    {({ open }: { open: boolean }) => (
                      <>
                        <Menu.Button as={Fragment}>
                          <button
                            className={clsx(
                              `text-gray-400 relative z-50 w-8 h-8 rounded inline-flex invisible group-hover:visible justify-center items-center`,
                              open ? `bg-gray-200` : `hover:bg-gray-200`,
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                          >
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                          </button>
                        </Menu.Button>
                        <Menu.Items className="text-sm absolute z-20 right-0 bg-white shadow-modal rounded-lg overflow-hidden py-2 w-64">
                          {getPageMenuItems(page).map((item) => {
                            return (
                              <Menu.Item key={item.text}>
                                <button
                                  type="button"
                                  className="h-10 flex w-full space-x-2 items-center px-3 hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    item.onClick()
                                  }}
                                >
                                  <span className="inline-flex">
                                    {item.icon}
                                  </span>
                                  <span>{item.text}</span>
                                </button>
                              </Menu.Item>
                            )
                          })}
                        </Menu.Items>
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
            className="w-full hover:bg-zinc-100 bg-zinc-50 rounded-lg transition-colors mt-4"
            variant="text"
            onClick={pages.fetchNextPage as () => void}
            isLoading={pages.isFetchingNextPage}
          >
            There are {(pages.data?.pages?.[0].total || 0) - currentLength} more{" "}
            {isPost ? "post" : "page"}
            {(pages.data?.pages?.[0].total || 0) - currentLength > 1 ? "s" : ""}
            , click to load more
          </Button>
        )}
      </div>
    </DashboardMain>
  )
}
