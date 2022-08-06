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
import { useGetPagesBySite, useDeletePage } from "~/queries/page"
import { MoreIcon } from "~/components/icons/MoreIcon"

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

  useEffect(() => {
    if (deletePage.isSuccess) {
      toast.success("Deleted!")
    }
  }, [deletePage.isSuccess])

  const pages = useGetPagesBySite({
    type: isPost ? "post" : "page",
    site: subdomain!,
    take: 1000,
    visibility,
    render: true,
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

  const getPageMenuItems = (page: { id: string }) => {
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
          deletePage.mutate({
            site: subdomain,
            id: page.id,
          })
        },
      },
    ]
  }

  const title = isPost ? "Posts" : "Pages"

  return (
    <DashboardMain>
      <header className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button
          type="button"
          className={clsx(
            `space-x-2 px-3 h-9 inline-flex items-center justify-center text-white rounded-lg text-sm`,

            isPost ? `bg-pink-500` : `bg-blue-500`,
          )}
          onClick={() =>
            router.push(
              `/dashboard/${subdomain}/editor?type=${isPost ? "post" : "page"}`,
            )
          }
        >
          <svg
            className="w-5 h-5"
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
        </button>
      </header>
      <Tabs items={tabItems} />

      <div className="-mt-3">
        {pages.data?.list.length === 0 && (
          <EmptyState resource={isPost ? "posts" : "pages"} />
        )}

        {pages.data?.list?.map((page) => {
          return (
            <Link key={page.id} href={getPageEditLink(page)}>
              <a className="group relative hover:bg-zinc-100 rounded-lg py-3 px-3 transition-colors -mx-3 flex justify-between">
                <div>
                  <div className="flex items-center">
                    <span>{page.title || "Untitled"}</span>
                  </div>
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
                    {({ open }) => (
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
                            <MoreIcon className="w-5 h-5" />
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
                                  <span>{item.icon}</span>
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
              </a>
            </Link>
          )
        })}
      </div>
    </DashboardMain>
  )
}
