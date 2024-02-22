"use client"

import { nanoid } from "nanoid"
import { useTranslations } from "next-intl"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { memo, useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

import type { EditorView } from "@codemirror/view"
import { useQueryClient } from "@tanstack/react-query"

import { Loading } from "~/components/common/Loading"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import DualColumnEditor from "~/components/dashboard/DualColumnEditor"
import EditorCover from "~/components/dashboard/editor-properties/EditorCover"
import EditorDisableAISummary from "~/components/dashboard/editor-properties/EditorDisableAISummary"
import EditorExcerpt from "~/components/dashboard/editor-properties/EditorExcerpt"
import EditorPublishAt from "~/components/dashboard/editor-properties/EditorPublishAt"
import EditorSlug from "~/components/dashboard/editor-properties/EditorSlug"
import EditorTags from "~/components/dashboard/editor-properties/EditorTags"
import { EditorToolbar } from "~/components/dashboard/EditorToolbar"
import { OptionsButton } from "~/components/dashboard/OptionsButton"
import { PublishButton } from "~/components/dashboard/PublishButton"
import PublishedModal from "~/components/dashboard/PublishedModal"
import { Button } from "~/components/ui/Button"
import { useModalStack } from "~/components/ui/ModalStack"
import { initialEditorState, useEditorState } from "~/hooks/useEditorState"
import { useGetState } from "~/hooks/useGetState"
import { useIsFullscreen } from "~/hooks/useIsFullscreen"
import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { useBeforeMounted } from "~/hooks/useSyncOnce"
import { showConfetti } from "~/lib/confetti"
import { getDefaultSlug } from "~/lib/default-slug"
import { crossbell2Editor } from "~/lib/editor-converter"
import { CSB_SCAN } from "~/lib/env"
import { getSiteLink, getTwitterShareUrl } from "~/lib/helpers"
import { getPageVisibility } from "~/lib/page-helpers"
import { delStorage, setStorage } from "~/lib/storage"
import {
  EditorValues,
  ExpandedNote,
  NoteType,
  PageVisibilityEnum,
} from "~/lib/types"
import { cn } from "~/lib/utils"
import { checkPageSlug } from "~/models/page.model"
import {
  useCreatePage,
  useDeletePage,
  useGetPage,
  useUpdatePage,
} from "~/queries/page"
import { useGetSite } from "~/queries/site"

export default function PostEditor() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations()
  const params = useParams()
  const subdomain = params?.subdomain as string
  const searchParams = useSearchParams()

  let pageId = searchParams?.get("id") as string | undefined
  const type = (searchParams?.get("type") || "post") as NoteType
  const defaultTag = searchParams?.get("tag")

  const site = useGetSite(subdomain)

  const isFullscreen = useIsFullscreen()

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
          `/dashboard/${subdomain}/editor?id=!local-${randomId}&type=${searchParams?.get(
            "type",
          )}${
            searchParams?.get("tag") ? "&tag=" + searchParams?.get("tag") : ""
          }`,
        )
      } else {
        key = `draft-${site.data?.characterId}-${pageId}`
      }
      setDraftKey(key)
      setDefaultSlug(
        key
          .replace(`draft-${site.data?.characterId}-!local-`, "")
          .replace(`draft-${site.data?.characterId}-`, ""),
      )
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

  const [visibility, setVisibility] = useState<PageVisibilityEnum>(
    PageVisibilityEnum.Draft,
  )

  useEffect(() => {
    if (page.isSuccess) {
      setVisibility(getPageVisibility(page.data || undefined))
    }
  }, [page.isSuccess, page.data])

  // reset editor state when page changes
  useBeforeMounted(() => {
    useEditorState.setState({
      ...initialEditorState,
      tags: defaultTag || "",
    })
  })

  const values = useEditorState()

  const [initialContent, setInitialContent] = useState("")
  const [defaultSlug, setDefaultSlug] = useState("")

  const getValues = useGetState(values)
  const getDraftKey = useGetState(draftKey)

  const updateValue = useCallback(
    (val: EditorValues) => {
      const _visibility = getPageVisibility(page.data || undefined) // can't get the correct visibility here, very strange
      if (_visibility !== PageVisibilityEnum.Draft) {
        setVisibility(PageVisibilityEnum.Modified)
      }

      const values = getValues()
      const draftKey = getDraftKey()
      if (val.title) {
        setDefaultSlug(
          getDefaultSlug(
            val.title,
            draftKey.replace(`draft-${site.data?.characterId}-`, ""),
          ),
        )
      }
      if (val.slug && !/^[a-zA-Z0-9\-_]*$/.test(val.slug)) {
        // Replace all invalid chars
        val.slug = val.slug.replace(/[^\w\-]/g, "-")
        toast.error(
          t("Slug can only contain letters, numbers, hyphens, and underscores"),
        )
      }
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
    [visibility, site.data?.characterId, type, queryClient, page.data],
  )

  const isMobileLayout = useIsMobileLayout()
  const [isRendering, setIsRendering] = useState(!isMobileLayout)

  // Save
  const createPage = useCreatePage()
  const updatePage = useUpdatePage()
  const savePage = async () => {
    const check = await checkPageSlug({
      slug: values.slug || defaultSlug,
      characterId: site.data?.characterId,
      noteId: page?.data?.noteId,
    })
    if (check) {
      toast.error(check)
    } else {
      const uniqueTags = Array.from(new Set(values.tags?.split(","))).join(",")

      const baseValues = {
        ...values,
        tags: uniqueTags,
        slug: values.slug || defaultSlug,
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
          `/dashboard/${subdomain}/editor?id=${
            createPage.data?.noteId
          }&type=${searchParams?.get("type")}`,
        )
      }

      const postUrl = `${getSiteLink({
        subdomain,
        domain: site.data?.metadata?.content?.custom_domain,
      })}/${encodeURIComponent(values.slug || defaultSlug)}`

      const transactionUrl = `${CSB_SCAN}/tx/${
        page.data?.updatedTransactionHash || page.data?.transactionHash // TODO
      }`

      const twitterShareUrl =
        page.data && site.data
          ? getTwitterShareUrl({
              page: {
                metadata: {
                  content: {
                    slug: encodeURIComponent(values.slug || defaultSlug),
                    title: values.title,
                  },
                },
              } as ExpandedNote,
              site: site.data,
              t,
            })
          : ""

      const modalId = "publish-modal"
      present({
        title: `🎉 ${t("Published!")}`,
        id: modalId,
        content: (props) => (
          <PublishedModal
            postUrl={postUrl}
            transactionUrl={transactionUrl}
            twitterShareUrl={twitterShareUrl}
            {...props}
          />
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
      router.push(`/dashboard/${subdomain}/${searchParams?.get("type")}s`)
    }
  }, [deleteP.isSuccess])

  // Init
  useEffect(() => {
    if (!page.data?.metadata?.content || !draftKey) return
    setInitialContent(page.data.metadata?.content?.content || "")
    useEditorState.setState(crossbell2Editor(page.data))
    setDefaultSlug(
      getDefaultSlug(
        page.data.metadata?.content?.title || "",
        draftKey.replace(`draft-${site.data?.characterId}-`, ""),
      ),
    )
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

  // editor
  const [view, setView] = useState<EditorView>()

  const onCreateEditor = useCallback(
    (view: EditorView) => {
      setView?.(view)
    },
    [setView],
  )

  const onChange = (value: string) => {
    updateValue({
      content: value,
    })
  }

  const onPreviewButtonClick = useCallback(() => {
    window.open(
      `/site/${subdomain}/preview/${draftKey.replace(
        `draft-${site.data?.characterId}-`,
        "",
      )}`,
    )
  }, [draftKey, subdomain, site.data?.characterId])

  const extraProperties = (
    <EditorExtraProperties
      defaultSlug={defaultSlug}
      updateValue={updateValue}
      type={type}
      characterId={site.data?.characterId}
      siteLink={getSiteLink({
        subdomain,
        domain: site.data?.metadata?.content?.custom_domain,
      })}
    />
  )

  return (
    <>
      <DashboardMain fullWidth>
        {page.isLoading ? (
          <Loading className="min-h-[300px]" />
        ) : (
          <>
            <header
              className={cn(
                "flex justify-between absolute top-0 inset-x-0 px-5 h-14 border-b items-center text-sm",
                isMobileLayout && "w-screen",
              )}
            >
              <div
                className={`flex items-center overflow-x-auto scrollbar-hide ${
                  isMobileLayout ? "flex-1" : undefined
                }`}
              >
                <EditorToolbar view={view}></EditorToolbar>
              </div>
              {!isFullscreen &&
                (isMobileLayout ? (
                  <div className="flex items-center space-x-3 w-auto pl-5">
                    <OptionsButton
                      visibility={visibility}
                      savePage={savePage}
                      deletePage={deletePage}
                      published={visibility !== PageVisibilityEnum.Draft}
                      isRendering={isRendering}
                      renderPage={setIsRendering}
                      propertiesWidget={extraProperties}
                      previewPage={onPreviewButtonClick}
                      type={type}
                      isModified={visibility === PageVisibilityEnum.Modified}
                      discardChanges={discardChanges}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 shrink-0">
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
                    <Button isAutoWidth onClick={onPreviewButtonClick}>
                      {t("Preview")}
                    </Button>
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
                      isDisabled={
                        visibility !== PageVisibilityEnum.Modified &&
                        visibility !== PageVisibilityEnum.Draft
                      }
                      type={type}
                      isModified={visibility === PageVisibilityEnum.Modified}
                      discardChanges={discardChanges}
                    />
                  </div>
                ))}
            </header>
            <div
              className={`pt-14 flex w-full ${
                isMobileLayout
                  ? "w-screen h-[calc(100vh-4rem)]"
                  : "min-w-[840px] h-screen "
              }`}
            >
              <div className="flex-1 pt-5 flex flex-col min-w-0">
                <div className="px-5 h-12">
                  <input
                    type="text"
                    name="title"
                    value={values.title}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                        view?.focus()
                      }
                    }}
                    onChange={(e) =>
                      updateValue({
                        title: e.target.value,
                      })
                    }
                    className="h-12 ml-1 inline-flex items-center border-none text-3xl font-bold w-full focus:outline-none bg-white"
                    placeholder={t("Title goes here") || ""}
                  />
                </div>
                <div className="mt-5 flex-1 min-h-0">
                  <DualColumnEditor
                    initialContent={initialContent}
                    onChange={onChange}
                    onCreateEditor={onCreateEditor}
                    isRendering={isRendering}
                    setIsRendering={setIsRendering}
                  />
                </div>
              </div>
              {!isMobileLayout && !isFullscreen && extraProperties}
            </div>
          </>
        )}
      </DashboardMain>
    </>
  )
}

const EditorExtraProperties = memo(
  ({
    type,
    updateValue,
    defaultSlug,
    characterId,
    siteLink,
  }: {
    updateValue: (val: EditorValues) => void
    type: NoteType
    defaultSlug: string
    characterId?: number
    siteLink?: string
  }) => {
    const t = useTranslations()

    const { present } = useModalStack()
    const openAdvancedOptions = () => {
      present({
        title: t("Advanced Settings"),
        content: () => (
          <div className="p-5 space-y-5">
            <EditorDisableAISummary updateValue={updateValue} />
            <EditorPublishAt
              updateValue={updateValue}
              prompt={t(
                `This ${type} will be accessible from this time Leave blank to use the current time`,
              )}
            />
          </div>
        ),
        modalProps: {
          withConfirm: true,
        },
      })
    }

    return (
      <div className="h-full overflow-auto w-[280px] border-l bg-zinc-50 p-5 space-y-5">
        <EditorCover
          updateValue={updateValue}
          prompt={t("Leave blank to use the first image in the post")}
        />
        <EditorTags updateValue={updateValue} characterId={characterId} />
        <EditorSlug
          updateValue={updateValue}
          defaultValue={defaultSlug}
          type={type}
          siteLink={siteLink}
        />
        <EditorExcerpt
          updateValue={updateValue}
          prompt={t("Leave it blank to use auto-generated excerpt")}
        />
        <div>
          <Button
            variant="secondary"
            className="border"
            type="button"
            isBlock
            onClick={openAdvancedOptions}
          >
            <span className="inline-flex items-center">
              <i className="i-mingcute-settings-4-fill inline-block mr-2" />
              <span>{t("Advanced Settings")}</span>
            </span>
          </Button>
        </div>
      </div>
    )
  },
)

EditorExtraProperties.displayName = "EditorExtraProperties"
