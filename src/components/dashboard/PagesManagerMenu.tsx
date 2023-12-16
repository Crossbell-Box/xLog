import { useTranslations } from "next-intl"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

import { Menu } from "@headlessui/react"
import { useQueryClient } from "@tanstack/react-query"

import { DeleteConfirmationModal } from "~/components/common/DeleteConfirmationModal"
import { useGetState } from "~/hooks/useGetState"
import { getNoteSlugFromNote, getTwitterShareUrl } from "~/lib/helpers"
import { delStorage, getStorage, setStorage } from "~/lib/storage"
import { ExpandedNote, NoteType } from "~/lib/types"
import { useDeletePage, usePinPage, useUpdatePage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

const usePageEditLink = (page: ExpandedNote, type: NoteType) => {
  const params = useParams()
  const subdomain = params?.subdomain as string

  return `/dashboard/${subdomain}/editor?id=${page.noteId}&type=${type}`
}

interface Item {
  text: string
  icon: JSX.Element
  onClick: () => void
}
export const PagesManagerMenu = ({
  type,
  page,
  onClick: onClose,
}: {
  type: NoteType
  page: ExpandedNote
  onClick: () => void
}) => {
  const t = useTranslations()

  const router = useRouter()
  const params = useParams()
  const subdomain = params?.subdomain as string
  const updatePage = useUpdatePage()

  const editLink = usePageEditLink(page, type)
  const queryClient = useQueryClient()
  const deletePage = useDeletePage()
  const pinPage = usePinPage(page)

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
      toast.error(t("Fail to Deleted"), {
        id: getDeleteToastId(),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletePage.isError])

  useEffect(() => {
    if (updatePage.isSuccess) {
      toast.success(t("Converted!"), {
        id: getCurrentToastId(),
      })
      updatePage.reset()
    } else if (updatePage.isError) {
      toast.error(t("Failed to convert"), {
        id: getCurrentToastId(),
      })
      updatePage.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePage.isSuccess, updatePage.isError])

  const site = useGetSite(subdomain)

  const items: Item[] = [
    {
      text: "Edit",
      icon: <span className="i-mingcute-edit-line inline-block"></span>,
      onClick() {
        router.push(editLink)
      },
    },
    {
      text: pinPage.isPinned ? "Unpin" : "Pin",
      icon: <span className="i-mingcute-pin-2-line inline-block"></span>,
      onClick: pinPage.togglePin,
    },
    {
      text: "Convert to " + (type === "post" ? "Page" : "Post"),
      icon: <span className="i-mingcute-transfer-3-line inline-block"></span>,
      onClick() {
        const toastId = toast.loading("Converting...")

        if (!page.noteId) {
          const data = getStorage(
            `draft-${site.data?.characterId}-${page.draftKey}`,
          )
          data.type = data.type === "post" ? "page" : "post"
          setStorage(`draft-${site.data?.characterId}-${page.draftKey}`, data)
          queryClient.invalidateQueries([
            "getPagesBySite",
            site.data?.characterId,
          ])
          queryClient.invalidateQueries(["getPage", page.characterId])
          toast.success("Converted!", {
            id: toastId,
          })
        } else {
          setConvertToastId(toastId)
          updatePage.mutate({
            type: type === "post" ? "page" : "post",
            characterId: page.characterId,
            noteId: page.noteId,
          })
        }
      },
    },
    {
      text: "Preview",
      icon: <span className="i-mingcute-eye-line inline-block"></span>,
      onClick() {
        const slug = getNoteSlugFromNote(page)
        if (!slug) return
        window.open(`/site/${subdomain}/${slug}`)
      },
    },
    {
      text: "Share to Twitter",
      icon: <span className="i-mingcute-twitter-line inline-block"></span>,
      onClick() {
        if (site.data) {
          const twitterShareUrl = getTwitterShareUrl({
            page,
            site: site.data,
            t,
          })
          window.open(twitterShareUrl)
        }
      },
    },
    {
      text: "Delete",
      icon: <span className="i-mingcute-delete-2-line inline-block"></span>,
      onClick() {
        setDeleteConfirmModalOpen(true)
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

  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] =
    useState<boolean>(false)
  const onDelete = () => {
    if (!page.noteId) {
      const toastId = toast.loading("Deleting...")
      delStorage(`draft-${site.data?.characterId}-${page.draftKey}`)
      Promise.all([
        queryClient.refetchQueries(["getPagesBySite", site.data?.characterId]),
        queryClient.refetchQueries(["getPage", page.characterId]),
      ]).then(() => {
        toast.success("Deleted!", {
          id: toastId,
        })
      })
    } else {
      setDeleteToastId(toast.loading("Deleting..."))
      deletePage.mutate({
        noteId: page.noteId,
        characterId: page.characterId,
      })
    }
  }

  return (
    <>
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
      <DeleteConfirmationModal
        open={deleteConfirmModalOpen}
        setOpen={setDeleteConfirmModalOpen}
        onConfirm={onDelete}
        type={type}
      />
    </>
  )
}
