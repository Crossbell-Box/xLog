import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import React, { useState } from "react"
import toast from "react-hot-toast"
import type { Note, Notes } from "unidata.js"

import type { UseInfiniteQueryResult } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"

import { type TabItem, Tabs } from "~/components/ui/Tabs"
import { APP_NAME } from "~/lib/env"
import { delStorage, getStorage, setStorage } from "~/lib/storage"
import { useCreateOrUpdatePage, useDeletePage } from "~/queries/page"

import { DeleteConfirmationModal } from "./DeleteConfirmationModal"

export const PagesManagerBatchSelectActionTab: React.FC<{
  isPost: boolean
  isNotxLogContent: boolean
  pages: UseInfiniteQueryResult<Notes, unknown>
  batchSelected: string[]
  setBatchSelected: (selected: string[]) => void
}> = ({ isPost, isNotxLogContent, pages, batchSelected, setBatchSelected }) => {
  const { t } = useTranslation(["dashboard", "site"])

  const router = useRouter()
  const subdomain = router.query.subdomain as string

  const queryClient = useQueryClient()

  // Convert or Delete page
  const createOrUpdatePage = useCreateOrUpdatePage()
  const deletePage = useDeletePage()

  const tabItems: TabItem[] = [
    {
      text: "Select All",
      onClick: () => {
        // Get all page IDs
        const allIDs: string[] = []
        pages.data?.pages.map((page) =>
          page.list?.map((page) => {
            allIDs.push(page.id)
          }),
        )
        setBatchSelected(allIDs)
      },
    },
    {
      text: "Deselect All",
      onClick: () => {
        setBatchSelected([])
      },
    },
    {
      text:
        "Convert to " +
        (isNotxLogContent
          ? `${APP_NAME} ${isPost ? "Post" : "Page"}`
          : isPost
          ? "Page"
          : "Post"),
      onClick: async () => {
        // Start message
        const toastId = toast.loading("Converting...")

        // Find all selected
        const selectedPages: Note[] = []
        pages.data?.pages.map((page) =>
          page.list?.map((page) => {
            if (batchSelected.includes(page.id)) {
              selectedPages.push(page)
            }
          }),
        )

        // Convert all // TODO: use multicall to optimize
        try {
          await Promise.all(
            selectedPages.map((page) => {
              // Check again to ensure it's not
              const isNotxLogContent = !page.applications?.includes("xlog")

              const targetNoteBase = {
                published: true,
                pageId: page.id,
                siteId: subdomain,
                tags: page.tags
                  ?.filter((tag) => tag !== "post" && tag !== "page")
                  ?.join(", "),
                applications: page.applications,
              }

              if (isNotxLogContent) {
                return createOrUpdatePage.mutateAsync({
                  ...targetNoteBase,
                  isPost: isPost, // Convert to xLog content
                })
              } else {
                if (!page.metadata) {
                  // Is draft
                  const data = getStorage(`draft-${subdomain}-${page.id}`)
                  data.isPost = !isPost
                  setStorage(`draft-${subdomain}-${page.id}`, data)
                } else {
                  // IsNote
                  return createOrUpdatePage.mutateAsync({
                    ...targetNoteBase,
                    isPost: !isPost, // Change type
                  })
                }
              }
            }),
          )

          toast.success(t("Converted!"), {
            id: toastId,
          })
        } catch (e) {
          // Some failed
          toast.error(t("Failed to convert."), {
            id: toastId,
          })
        }

        // Invalidate site data refresh
        await Promise.all([
          queryClient.invalidateQueries(["getPagesBySite", subdomain]),
          ...selectedPages.map((page) =>
            queryClient.invalidateQueries(["getPage", page.id]),
          ),
        ])

        // Unselect all
        setBatchSelected([])
      },
    },
    {
      text: "Delete",
      onClick: async () => {
        setDeleteConfirmModalOpen(true)
      },
    },
  ]

  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] =
    useState<boolean>(false)
  const onDelete = async () => {
    // Start message
    const toastId = toast.loading("Deleting...")

    // Find all selected
    const selectedPages: Note[] = []
    pages.data?.pages.map((page) =>
      page.list?.map((page) => {
        if (batchSelected.includes(page.id)) {
          selectedPages.push(page)
        }
      }),
    )

    // Delete all // TODO: use multicall to optimize
    try {
      await Promise.all(
        selectedPages.map((page) => {
          if (!page.metadata) {
            // Is draft
            delStorage(`draft-${subdomain}-${page.id}`)
          } else {
            // Is Note
            return deletePage.mutateAsync({
              site: subdomain,
              id: page.id,
            })
          }
        }),
      )

      toast.success(t("Deleted!"), {
        id: toastId,
      })
    } catch (e) {
      toast.error(t("Fail to Deleted."), {
        // It should be "Failed to delete.", but the translation key is that so :shrug:
        id: toastId,
      })
    }

    // Refresh site data
    await Promise.all([
      queryClient.refetchQueries(["getPagesBySite", subdomain]),
      ...selectedPages.map((page) =>
        queryClient.refetchQueries(["getPage", page.id]),
      ),
    ])

    // Unselect all
    setBatchSelected([])
  }

  return (
    <>
      <Tabs items={tabItems} />
      <DeleteConfirmationModal
        open={deleteConfirmModalOpen}
        setOpen={setDeleteConfirmModalOpen}
        onConfirm={onDelete}
        isPost={isPost}
      />
    </>
  )
}

export default PagesManagerBatchSelectActionTab
