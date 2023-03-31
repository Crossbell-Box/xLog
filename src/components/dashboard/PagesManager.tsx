import { Fragment, useEffect, useMemo, useState } from "react"
import { getPageVisibility } from "~/lib/page-helpers"
import { useDate } from "~/hooks/useDate"
import { TabItem, Tabs } from "../ui/Tabs"
import { Menu } from "@headlessui/react"
import { cn } from "~/lib/utils"
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
import { delStorage, getStorage, setStorage } from "~/lib/storage"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "../ui/Button"
import { UniLink } from "../ui/UniLink"
import { nanoid } from "nanoid"
import { Tooltip } from "../ui/Tooltip"
import { APP_NAME } from "~/lib/env"
import { Trans, useTranslation } from "next-i18next"
import { readFiles } from "~/lib/read-files"

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
  const { t } = useTranslation(["dashboard", "site"])
  const date = useDate()

  useEffect(() => {
    if (deletePage.isSuccess) {
      toast.success(t("Deleted!"), {
        id: deleteToastId,
      })
    }
  }, [deletePage.isSuccess, deleteToastId, t])

  useEffect(() => {
    if (createOrUpdatePage.isSuccess) {
      toast.success(t("Converted!"), {
        id: convertToastId,
      })
    } else if (createOrUpdatePage.isError) {
      toast.error(t("Failed to convert."), {
        id: convertToastId,
      })
    }
  }, [
    createOrUpdatePage.isSuccess,
    createOrUpdatePage.isError,
    convertToastId,
    t,
  ])

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
        icon: <span className="i-mingcute:edit-line inline-block"></span>,
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
        icon: <span className="i-mingcute:transfer-3-line inline-block"></span>,
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
        icon: <span className="i-mingcute:delete-2-line inline-block"></span>,
        onClick() {
          if (!page.metadata) {
            const toastId = toast.loading("Deleting...")
            delStorage(`draft-${subdomain}-${page.id}`)
            Promise.all([
              queryClient.refetchQueries(["getPagesBySite", subdomain]),
              queryClient.refetchQueries(["getPage", page.id]),
            ]).then(() => {
              toast.success("Deleted!", {
                id: toastId,
              })
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
      const file = (await readFiles(e.target?.files))?.[0]
      if (file) {
        const id = nanoid()
        const key = `draft-${subdomain}-local-${id}`
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
        queryClient.invalidateQueries(["getPagesBySite", subdomain])
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
        <Trans i18nKey="posts description" ns="dashboard">
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
        <Trans i18nKey="pages description" ns="dashboard">
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
        <Trans i18nKey="pages add" ns="dashboard">
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
              <span className="i-mingcute:add-line inline-block"></span>
              <span>{t(`New ${isPost ? "Post" : "Page"}`)}</span>
            </Button>
            <span className="hidden sm:inline-flex">
              <Tooltip
                label={t("Import markdown file with front matter supported")}
                placement="bottom"
              >
                <Button className={cn(`space-x-2`)} onClick={importFile}>
                  <span className="i-mingcute:file-import-line inline-block"></span>
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
                      {t(getPageVisibility(page))}
                    </span>
                    <span className="mx-2">·</span>
                    <span>
                      {getPageVisibility(page) === PageVisibilityEnum.Draft
                        ? date.formatDate(page.date_updated)
                        : date.formatDate(page.date_published)}
                    </span>
                  </div>
                </div>
                <div className="w-10 flex-shrink-0">
                  <Menu>
                    {({ open }: { open: boolean }) => (
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
                            <i className="i-mingcute:more-1-line text-2xl" />
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
                                  <span>{t(item.text)}</span>
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
            className="w-full bg-zinc-50 rounded-lg mt-4"
            variant="text"
            onClick={pages.fetchNextPage as () => void}
            isLoading={pages.isFetchingNextPage}
          >
            {t("load more", {
              name: t(
                isPost
                  ? "post"
                  : "page" +
                      ((pages.data?.pages?.[0].total || 0) - currentLength > 1
                        ? "s"
                        : ""),
              ),
              count: (pages.data?.pages?.[0].total || 0) - currentLength,
              ns: "site",
            })}
          </Button>
        )}
      </div>
    </DashboardMain>
  )
}
