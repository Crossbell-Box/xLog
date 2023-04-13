import { FC, useEffect, useState } from "react"
import { Menu } from "@headlessui/react"
import { useRouter } from "next/router"
import toast from "react-hot-toast"
import type { Note } from "unidata.js"
import { useDeletePage, useCreateOrUpdatePage } from "~/queries/page"
import { delStorage, getStorage, setStorage } from "~/lib/storage"
import { useQueryClient } from "@tanstack/react-query"
import { APP_NAME } from "~/lib/env"
import { useTranslation } from "next-i18next"
import { useGetState } from "~/hooks/useGetState"

const usePageEditLink = (page: { id: string }, isPost: boolean) => {
  const router = useRouter()
  const subdomain = router.query.subdomain as string

  return `/dashboard/${subdomain}/editor?id=${page.id}&type=${
    isPost ? "post" : "page"
  }`
}

export const PagesManagerMenu: FC<{
  isPost: boolean
  page: Note
  onClick: () => void
}> = ({ isPost, page, onClick: onClose }) => {
  const { t } = useTranslation(["dashboard", "site"])

  const isCrossbell = !page.applications?.includes("xlog")
  const router = useRouter()
  const createOrUpdatePage = useCreateOrUpdatePage()

  const editLink = usePageEditLink(page, isPost)
  const subdomain = router.query.subdomain as string
  const queryClient = useQueryClient()
  const deletePage = useDeletePage()

  const [convertToastId, setConvertToastId] = useState("")
  const [deleteToastId, setDeleteToastId] = useState("")

  const getDeleteToastId = useGetState(deleteToastId)
  const getCurrentToastId = useGetState(convertToastId)

  useEffect(() => {
    if (deletePage.isSuccess) {
      toast.success(t("Deleted!"), {
        id: getDeleteToastId(),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletePage.isSuccess])

  useEffect(() => {
    if (deletePage.isError) {
      toast.error(t("Fail to Deleted."), {
        id: getDeleteToastId(),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletePage.isError])

  useEffect(() => {
    if (createOrUpdatePage.isSuccess) {
      toast.success(t("Converted!"), {
        id: getCurrentToastId(),
      })
    } else if (createOrUpdatePage.isError) {
      toast.error(t("Failed to convert."), {
        id: getCurrentToastId(),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createOrUpdatePage.isSuccess, createOrUpdatePage.isError])

  const items = [
    {
      text: "Edit",
      icon: <span className="i-mingcute:edit-line inline-block"></span>,
      onClick() {
        router.push(editLink)
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

  useEffect(() => {
    return () => {
      if (getDeleteToastId()) {
        toast.success(t("Deleted!"), {
          id: getDeleteToastId(),
        })
      }
    }
  }, [])

  return (
    <Menu.Items className="text-sm absolute z-20 right-0 bg-white shadow-modal rounded-lg overflow-hidden py-2 w-64 ring-1 ring-border">
      {items.map((item) => {
        return (
          <Menu.Item key={item.text}>
            <button
              type="button"
              className="h-10 flex w-full space-x-2 items-center px-3 hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault()
                item.onClick()
                onClose()
              }}
            >
              <span className="inline-flex">{item.icon}</span>
              <span>{t(item.text)}</span>
            </button>
          </Menu.Item>
        )
      })}
    </Menu.Items>
  )
}
