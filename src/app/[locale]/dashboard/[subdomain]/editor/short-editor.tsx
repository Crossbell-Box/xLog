"use client"

import { nanoid } from "nanoid"
import { useTranslations } from "next-intl"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { memo, useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

import { useQueryClient } from "@tanstack/react-query"

import { Loading } from "~/components/common/Loading"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import EditorContent from "~/components/dashboard/editor-properties/EditorContent"
import EditorImages from "~/components/dashboard/editor-properties/EditorImages"
import EditorPublishAt from "~/components/dashboard/editor-properties/EditorPublishAt"
import EditorTitle from "~/components/dashboard/editor-properties/EditorTitle"
import { PublishButton } from "~/components/dashboard/PublishButton"
import PublishedModal from "~/components/dashboard/PublishedModal"
import { useModalStack } from "~/components/ui/ModalStack"
import { initialEditorState, useEditorState } from "~/hooks/useEditorState"
import { useGetState } from "~/hooks/useGetState"
import { useBeforeMounted } from "~/hooks/useSyncOnce"
import { showConfetti } from "~/lib/confetti"
import { crossbell2Editor } from "~/lib/editor-converter"
import { CSB_SCAN } from "~/lib/env"
import { getTwitterShareUrl } from "~/lib/helpers"
import { getPageVisibility } from "~/lib/page-helpers"
import { delStorage, setStorage } from "~/lib/storage"
import { EditorValues, PageVisibilityEnum } from "~/lib/types"
import { cn } from "~/lib/utils"
import {
  useCreatePage,
  useDeletePage,
  useGetPage,
  useUpdatePage,
} from "~/queries/page"
import { useGetSite } from "~/queries/site"

export default function ShortEditor() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations()
  const params = useParams()
  const subdomain = params?.subdomain as string
  const searchParams = useSearchParams()

  let pageId = searchParams?.get("id") as string | undefined
  const type = "short"

  const site = useGetSite(subdomain)

  const [draftKey, setDraftKey] = useState<string>("")
  useEffect(() => {
    if (subdomain) {
      let key
      if (!pageId) {
        const randomId = nanoid()
        key = `draft-${site.data?.characterId}-!local-${randomId}`
        queryClient.invalidateQueries([
          "getPagesBySite",
          site.data?.characterId,
        ])
        router.replace(
          `/dashboard/${subdomain}/editor?id=!local-${randomId}&type=${type}`,
        )
      } else {
        key = `draft-${site.data?.characterId}-${pageId}`
      }
      setDraftKey(key)
    }
  }, [
    subdomain,
    pageId,
    queryClient,
    router,
    site.data?.characterId,
    searchParams,
  ])

  const page = useGetPage({
    characterId: site.data?.characterId,
    noteId: pageId && /\d+/.test(pageId) ? +pageId : undefined,
    slug: pageId || draftKey.replace(`draft-${site.data?.characterId}-`, ""),
    handle: subdomain,
    disableAutofill: true,
  })

  const [visibility, setVisibility] = useState<PageVisibilityEnum>()

  useEffect(() => {
    if (page.isSuccess) {
      setVisibility(getPageVisibility(page.data || undefined))
    }
  }, [page.isSuccess, page.data])

  // reset editor state when page changes
  useBeforeMounted(() => {
    useEditorState.setState({
      ...initialEditorState,
    })
  })

  const values = useEditorState()

  const getValues = useGetState(values)
  const updateValue = useCallback(
    (val: EditorValues) => {
      if (visibility !== PageVisibilityEnum.Draft) {
        setVisibility(PageVisibilityEnum.Modified)
      }

      const values = getValues()
      const newValues = { ...values, ...val }
      if (draftKey) {
        setStorage(draftKey, {
          date: +new Date(),
          values: newValues,
          type,
        })
        queryClient.invalidateQueries([
          "getPagesBySite",
          site.data?.characterId,
        ])
      }
      useEditorState.setState(newValues)
    },
    [visibility],
  )

  // Save
  const createPage = useCreatePage()
  const updatePage = useUpdatePage()

  const savePage = async () => {
    if (!values.images?.length) {
      toast.error(t("Please upload at least one image"))
      return
    }
    const baseValues = {
      ...values,
      characterId: site.data?.characterId,
    }
    if (visibility === PageVisibilityEnum.Draft) {
      createPage.mutate({
        ...baseValues,
        type,
      })
    } else {
      updatePage.mutate({
        ...baseValues,
        noteId: page?.data?.noteId,
      })
    }
  }

  const { present } = useModalStack()

  useEffect(() => {
    if (createPage.isSuccess || updatePage.isSuccess) {
      if (draftKey) {
        delStorage(draftKey)
        queryClient.invalidateQueries([
          "getPagesBySite",
          site.data?.characterId,
        ])
        queryClient.invalidateQueries([
          "getPage",
          draftKey.replace(`draft-${site.data?.characterId}-`, ""),
        ])
      } else {
        queryClient.invalidateQueries(["getPage", pageId])
      }

      if (createPage.data?.noteId) {
        router.replace(
          `/dashboard/${subdomain}/editor?id=${createPage.data?.noteId}&type=${type}`,
        )
      }

      const transactionUrl = `${CSB_SCAN}/tx/${
        page.data?.updatedTransactionHash || page.data?.transactionHash // TODO
      }`

      const modalId = "publish-modal"
      present({
        title: `🎉 ${t("Published!")}`,
        id: modalId,
        content: (props) => (
          <PublishedModal transactionUrl={transactionUrl} {...props} />
        ),
      })

      showConfetti()

      createPage.reset()
      updatePage.reset()
    }
  }, [createPage.isSuccess, updatePage.isSuccess])

  useEffect(() => {
    if (createPage.isError || updatePage.isError) {
      toast.error("Error: " + (createPage.error || updatePage.error))
      createPage.reset()
      updatePage.reset()
    }
  }, [createPage.isError, updatePage.isSuccess])

  // Delete
  const deleteP = useDeletePage()
  const deletePage = async () => {
    if (page.data) {
      if (!page.data?.noteId) {
        // Is draft
        delStorage(`draft-${page.data.characterId}-${page.data.draftKey}`)
      } else {
        // Is Note
        return deleteP.mutate({
          noteId: page.data.noteId,
          characterId: page.data.characterId,
        })
      }
    }
  }

  useEffect(() => {
    if (deleteP.isSuccess) {
      toast.success(t("Deleted!"))
      deleteP.reset()
      router.push(`/dashboard/${subdomain}/${type}s`)
    }
  }, [deleteP.isSuccess])

  // Init
  useEffect(() => {
    if (!page.data?.metadata || !draftKey) return
    useEditorState.setState(crossbell2Editor(page.data))
  }, [page.data, subdomain, draftKey, site.data?.characterId])

  // Reset
  const discardChanges = useCallback(() => {
    if (draftKey) {
      delStorage(draftKey)
      queryClient.invalidateQueries(["getPagesBySite", site.data?.characterId])
      page.remove()
      page.refetch()
    }
  }, [draftKey, site.data?.characterId])

  return (
    <>
      <DashboardMain className="max-w-screen-lg" title="Edit short">
        {page.isLoading ? (
          <Loading className="min-h-[300px]" />
        ) : (
          <>
            <EditorExtraProperties updateValue={updateValue} />
            <div className="flex justify-between h-14 items-center text-sm mt-8">
              <div className="flex items-center space-x-3 shrink-0">
                <PublishButton
                  savePage={savePage}
                  deletePage={deletePage}
                  twitterShareUrl={
                    page.data && site.data
                      ? getTwitterShareUrl({
                          page: page.data,
                          site: site.data,
                          t,
                        })
                      : ""
                  }
                  published={visibility !== PageVisibilityEnum.Draft}
                  isSaving={
                    createPage.isLoading ||
                    updatePage.isLoading ||
                    deleteP.isLoading
                  }
                  isDisabled={false}
                  type={type}
                  isModified={visibility === PageVisibilityEnum.Modified}
                  discardChanges={discardChanges}
                  placement="top-start"
                />
                <span
                  className={cn(
                    `text-sm capitalize`,
                    visibility === PageVisibilityEnum.Draft
                      ? `text-zinc-300`
                      : visibility === PageVisibilityEnum.Modified
                        ? "text-orange-600"
                        : "text-green-600",
                  )}
                >
                  {t(visibility as string)}
                </span>
              </div>
            </div>
          </>
        )}
      </DashboardMain>
    </>
  )
}

const EditorExtraProperties = memo(
  ({ updateValue }: { updateValue: (val: EditorValues) => void }) => {
    const t = useTranslations()

    return (
      <div className="w-full space-y-5">
        <EditorImages updateValue={updateValue} />
        <EditorTitle updateValue={updateValue} />
        <EditorContent updateValue={updateValue} />
        <EditorPublishAt
          updateValue={updateValue}
          prompt={t(
            "This short will be accessible from this time Leave blank to use the current time",
          )}
        />
      </div>
    )
  },
)

EditorExtraProperties.displayName = "EditorExtraProperties"
