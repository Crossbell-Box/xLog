import { useTranslations } from "next-intl"
import React, { useState } from "react"
import toast from "react-hot-toast"

import type { InfiniteData } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"

import { DeleteConfirmationModal } from "~/components/common/DeleteConfirmationModal"
import { Tabs, type TabItem } from "~/components/ui/Tabs"
import { delStorage, getStorage, setStorage } from "~/lib/storage"
import { ExpandedNote, NoteType } from "~/lib/types"
import { useDeletePage, useUpdatePage } from "~/queries/page"

function getPageId(page: ExpandedNote) {
  return page.noteId || page.draftKey || 0
}

export const PagesManagerBatchSelectActionTab = ({
  type,
  pages,
  batchSelected,
  setBatchSelected,
}: {
  type: NoteType
  pages?: InfiniteData<{
    list: ExpandedNote[]
  }>
  batchSelected: (string | number)[]
  setBatchSelected: (selected: (string | number)[]) => void
}) => {
  const t = useTranslations()

  const queryClient = useQueryClient()

  // Convert or Delete page
  const updatePage = useUpdatePage()
  const deletePage = useDeletePage()

  const tabItems: TabItem[] = [
    {
      text: "Select All",
      onClick: () => {
        // Get all page IDs
        const allIDs: (string | number)[] = []
        pages?.pages.map((page) =>
          page.list?.map((page) => {
            allIDs.push(getPageId(page))
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
      text: "Convert to " + (type === "post" ? "Page" : "Post"),
      onClick: async () => {
        // Start message
        const toastId = toast.loading("Converting...")

        // Find all selected
        const selectedPages: ExpandedNote[] = []
        pages?.pages.map((page) =>
          page.list?.map((page) => {
            if (batchSelected.includes(getPageId(page))) {
              selectedPages.push(page)
            }
          }),
        )

        // Convert all // TODO: use multicall to optimize
        try {
          await Promise.all(
            selectedPages.map((page) => {
              if (!page.noteId) {
                // Is draft
                const key = `draft-${page?.characterId}-${page.draftKey}`
                const data = getStorage(key)
                data.type = data.type === "post" ? "page" : "post"
                setStorage(key, data)
              } else {
                // IsNote
                return updatePage.mutate({
                  characterId: page.characterId,
                  noteId: page.noteId,
                  type: type === "post" ? "page" : "post",
                })
              }
            }),
          )
        } catch (e) {
          // Some failed
          toast.error(t("Failed to convert"), {
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
            return deletePage.mutate({
              noteId: page.noteId,
              characterId: page.characterId,
            })
          }
        }),
      )

      toast.success(t("Deleted!"), {
        id: toastId,
      })
    } catch (e) {
      toast.error(t("Fail to Deleted"), {
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
        type={type}
      />
    </>
  )
}

export default PagesManagerBatchSelectActionTab
