import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import React from "react"
import toast from "react-hot-toast"
import type { Note, Notes } from "unidata.js"

import type { UseInfiniteQueryResult } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"

import { type TabItem, Tabs } from "~/components/ui/Tabs"
import { delStorage, getStorage, setStorage } from "~/lib/storage"
import { useCreateOrUpdatePage, useDeletePage } from "~/queries/page"

const PagesManagerSelectHeader: React.FC<{
  isPost: boolean
  pages: UseInfiniteQueryResult<Notes, unknown>
  batchSelected: string[]
  setBatchSelected: (selected: string[]) => void
}> = ({ isPost, pages, batchSelected, setBatchSelected }) => {
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
      text: "Convert",
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
              createOrUpdatePage.mutate({
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
                createOrUpdatePage.mutate({
                  ...targetNoteBase,
                  isPost: !isPost, // Change type
                })
              }
            }
          }),
        )

        // Invalidate site data refresh
        await Promise.all([
          queryClient.invalidateQueries(["getPagesBySite", subdomain]),
          ...selectedPages.map((page) =>
            queryClient.invalidateQueries(["getPage", page.id]),
          ),
        ])

        toast.success(t("Convert process started!"), {
          id: toastId,
        })

        // Unselect all
        setBatchSelected([])
      },
    },
    {
      text: "Delete",
      onClick: async () => {
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
        await Promise.all(
          selectedPages.map((page) => {
            if (!page.metadata) {
              // Is draft
              delStorage(`draft-${subdomain}-${page.id}`)
            } else {
              // Is Note
              deletePage.mutate({
                site: subdomain,
                id: page.id,
              })
            }
          }),
        )

        // Refresh site data
        await Promise.all([
          queryClient.refetchQueries(["getPagesBySite", subdomain]),
          ...selectedPages.map((page) =>
            queryClient.refetchQueries(["getPage", page.id]),
          ),
        ])

        toast.success(t("Deleted process started!"), {
          id: toastId,
        })

        // Unselect all
        setBatchSelected([])
      },
    },
  ]

  return <Tabs items={tabItems} />
}

export default PagesManagerSelectHeader
