import { useTranslation } from "next-i18next"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import toast from "react-hot-toast"

import type { InfiniteData } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"

import { type TabItem, Tabs } from "~/components/ui/Tabs"
import { APP_NAME } from "~/lib/env"
import { delStorage, getStorage, setStorage } from "~/lib/storage"
import { ExpandedNote } from "~/lib/types"
import { useCreateOrUpdatePage, useDeletePage } from "~/queries/page"

import { DeleteConfirmationModal } from "./DeleteConfirmationModal"

export const PagesManagerBatchSelectActionTab: React.FC<{
  isPost: boolean
  isNotxLogContent: boolean
  pages?: InfiniteData<{
    list: ExpandedNote[]
  }>
  batchSelected: (string | number)[]
  setBatchSelected: (selected: string[]) => void
}> = ({ isPost, isNotxLogContent, pages, batchSelected, setBatchSelected }) => {
  const { t } = useTranslation(["dashboard", "site"])

  const params = useParams()
  const subdomain = params?.subdomain as string

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
        pages?.pages.map((page) =>
          page.list?.map((page) => {
            allIDs.push(page.metadata?.content?.slug || "")
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
        const selectedPages: ExpandedNote[] = []
        pages?.pages.map((page) =>
          page.list?.map((page) => {
            if (batchSelected.includes(page.metadata?.content?.slug || "")) {
              selectedPages.push(page)
            }
          }),
        )

        // Convert all // TODO: use multicall to optimize
        try {
          await Promise.all(
            selectedPages.map((page) => {
              // Check again to ensure it's not
              const isNotxLogContent =
                !page.metadata?.content?.sources?.includes("xlog")

              const targetNoteBase = {
                published: true,
                pageId: `${page.characterId}-${page.noteId}`,
                siteId: subdomain,
                tags: page.metadata?.content?.tags
                  ?.filter((tag) => tag !== "post" && tag !== "page")
                  ?.join(", "),
                applications: page.metadata?.content?.sources,
              }

              if (isNotxLogContent) {
                return createOrUpdatePage.mutateAsync({
                  ...targetNoteBase,
                  isPost: isPost, // Convert to xLog content
                  characterId: page.characterId,
                })
              } else {
                if (!page.noteId) {
                  // Is draft
                  const key = `draft-${page?.characterId}-${page.draftKey}`
                  const data = getStorage(key)
                  data.isPost = !isPost
                  setStorage(key, data)
                } else {
                  // IsNote
                  return createOrUpdatePage.mutateAsync({
                    ...targetNoteBase,
                    isPost: !isPost, // Change type
                    characterId: page.characterId,
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
          queryClient.invalidateQueries([
            "getPagesBySite",
            selectedPages[0]?.characterId,
          ]),
          ...selectedPages.map((page) =>
            queryClient.invalidateQueries(["getPage", page?.characterId]),
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
    const selectedPages: ExpandedNote[] = []
    pages?.pages.map((page) =>
      page.list?.map((page) => {
        if (batchSelected.includes(page.noteId || page.draftKey || 0)) {
          selectedPages.push(page)
        }
      }),
    )

    // Delete all // TODO: use multicall to optimize
    try {
      await Promise.all(
        selectedPages.map((page) => {
          if (!page.noteId) {
            // Is draft
            delStorage(`draft-${page?.characterId}-${page.draftKey}`)
          } else {
            // Is Note
            return deletePage.mutateAsync({
              site: subdomain,
              id: `${page.characterId}-${page.noteId}`,
              characterId: page.characterId,
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
      queryClient.refetchQueries([
        "getPagesBySite",
        selectedPages[0]?.characterId,
      ]),
      ...selectedPages.map((page) =>
        queryClient.refetchQueries(["getPage", page.characterId]),
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
