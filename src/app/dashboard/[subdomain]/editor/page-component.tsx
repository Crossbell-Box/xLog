"use client"

import { useDebounceEffect } from "ahooks"
import type { Root } from "mdast"
import { nanoid } from "nanoid"
import dynamic from "next/dynamic"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  ChangeEvent,
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import toast from "react-hot-toast"
import { shallow } from "zustand/shallow"

import type { EditorView } from "@codemirror/view"
import { DateInput } from "@mantine/dates"
import { useQueryClient } from "@tanstack/react-query"

import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { OptionsButton } from "~/components/dashboard/OptionsButton"
import { PublishButton } from "~/components/dashboard/PublishButton"
import { Button } from "~/components/ui/Button"
import { CodeMirrorEditor } from "~/components/ui/CodeMirror"
import { EditorToolbar } from "~/components/ui/EditorToolbar"
import { FieldLabel } from "~/components/ui/FieldLabel"
import { ImageUploader } from "~/components/ui/ImageUploader"
import { Input } from "~/components/ui/Input"
import { ModalContentProps, useModalStack } from "~/components/ui/ModalStack"
import { Switch } from "~/components/ui/Switch"
import { TagInput } from "~/components/ui/TagInput"
import { UniLink } from "~/components/ui/UniLink"
import { toolbarShortcuts, toolbars } from "~/editor"
import { editorUpload } from "~/editor/Multimedia"
import {
  Values,
  initialEditorState,
  useEditorState,
} from "~/hooks/useEditorState"
import { useGetState } from "~/hooks/useGetState"
import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { useBeforeMounted } from "~/hooks/useSyncOnce"
import { useUploadFile } from "~/hooks/useUploadFile"
import { showConfetti } from "~/lib/confetti"
import { getDefaultSlug } from "~/lib/default-slug"
import { CSB_SCAN } from "~/lib/env"
import { getSiteLink, getTwitterShareUrl } from "~/lib/helpers"
import { useTranslation } from "~/lib/i18n/client"
import { getPageVisibility } from "~/lib/page-helpers"
import { delStorage, setStorage } from "~/lib/storage"
import { PageVisibilityEnum } from "~/lib/types"
import { cn, pick } from "~/lib/utils"
import { Rendered, renderPageContent } from "~/markdown"
import { checkPageSlug } from "~/models/page.model"
import {
  useCreatePage,
  useDeletePage,
  useGetDistinctNoteTagsOfCharacter,
  useGetPage,
  useUpdatePage,
} from "~/queries/page"
import { useGetSite } from "~/queries/site"

const DynamicPageContent = dynamic(
  () => import("~/components/common/PageContent"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white px-5 overflow-scroll pb-[200px] h-full flex-1 text-center">
        Loading...
      </div>
    ),
  },
)

export default function SubdomainEditor() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { t } = useTranslation("dashboard")
  const params = useParams()
  const subdomain = params?.subdomain as string
  const searchParams = useSearchParams()

  let pageId = searchParams?.get("id") as string | undefined
  const isPost = searchParams?.get("type") === "post"

  const site = useGetSite(subdomain)

  const [draftKey, setDraftKey] = useState<string>("")
  useEffect(() => {
    if (subdomain) {
      let key
      if (!pageId) {
        const randomId = nanoid()
        key = `draft-${site.data?.characterId}-local-${randomId}`
        setDraftKey(key)
        queryClient.invalidateQueries([
          "getPagesBySite",
          site.data?.characterId,
        ])
        router.replace(
          `/dashboard/${subdomain}/editor?id=local-${randomId}&type=${searchParams?.get(
            "type",
          )}`,
        )
      } else {
        key = `draft-${site.data?.characterId}-${pageId}`
      }
      setDraftKey(key)
      setDefaultSlug(
        key
          .replace(`draft-${site.data?.characterId}-local-`, "")
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
  })

  const userTags = useGetDistinctNoteTagsOfCharacter(site.data?.characterId)

  const [visibility, setVisibility] = useState<PageVisibilityEnum>()

  useEffect(() => {
    if (page.isSuccess) {
      setVisibility(getPageVisibility(page.data || undefined))
    }
  }, [page.isSuccess, page.data])

  const uploadFile = useUploadFile()

  // reset editor state when page changes
  useBeforeMounted(() => {
    useEditorState.setState(initialEditorState)
  })

  const values = useEditorState()

  const [initialContent, setInitialContent] = useState("")
  const [defaultSlug, setDefaultSlug] = useState("")

  const getValues = useGetState(values)
  const getDraftKey = useGetState(draftKey)

  const updateValue = useCallback(
    <K extends keyof Values>(key: K, value: Values[K]) => {
      if (visibility !== PageVisibilityEnum.Draft) {
        setVisibility(PageVisibilityEnum.Modified)
      }

      const values = getValues()
      const draftKey = getDraftKey()
      if (key === "title") {
        setDefaultSlug(
          getDefaultSlug(
            value as string,
            draftKey.replace(`draft-${site.data?.characterId}-`, ""),
          ),
        )
      }
      if (key === "slug" && !/^[a-zA-Z0-9\-_]*$/.test(value as string)) {
        // Replace all invalid chars
        ;(value as string) = (value as string).replace(/[^\w\-]/g, "-")
        toast.error(
          t(
            "Slug can only contain letters, numbers, hyphens, and underscores.",
          ),
        )
      }
      const newValues = { ...values, [key]: value }
      if (draftKey) {
        setStorage(draftKey, {
          date: +new Date(),
          values: newValues,
          isPost: isPost,
        })
        queryClient.invalidateQueries([
          "getPagesBySite",
          site.data?.characterId,
        ])
      }
      useEditorState.setState(newValues)
    },
    [isPost, queryClient, subdomain, visibility],
  )

  const createPage = useCreatePage()
  const updatePage = useUpdatePage()

  const isMobileLayout = useIsMobileLayout()
  const [isRendering, setIsRendering] = useState(!isMobileLayout)

  const savePage = async () => {
    const check = await checkPageSlug({
      slug: values.slug || defaultSlug,
      characterId: site.data?.characterId,
      noteId: page?.data?.noteId,
    })
    if (check) {
      toast.error(check)
    } else {
      const uniqueTags = Array.from(new Set(values.tags.split(","))).join(",")

      const baseValues = {
        ...values,
        tags: uniqueTags,
        slug: values.slug || defaultSlug,
        characterId: site.data?.characterId,
        cover: values.cover,
        disableAISummary: values.disableAISummary,
      }
      if (visibility === PageVisibilityEnum.Draft) {
        createPage.mutate({
          ...baseValues,
          isPost: isPost,
        })
      } else {
        updatePage.mutate({
          ...baseValues,
          noteId: page?.data?.noteId,
        })
      }
    }
  }

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

  const { present, dismiss } = useModalStack()

  const postUrl = `${getSiteLink({
    subdomain,
    domain: site.data?.metadata?.content?.custom_domain,
  })}/${encodeURIComponent(values.slug || defaultSlug)}`
  const transactionUrl = `${CSB_SCAN}/tx/${
    page.data?.updatedTransactionHash || page.data?.transactionHash
  }`

  const twitterShareUrl =
    page.data && site.data
      ? getTwitterShareUrl({
          page: page.data,
          site: site.data,
          t,
        })
      : ""

  const getPostUrl = useGetState(postUrl)
  const getTransactionUrl = useGetState(transactionUrl)
  const getTwitterShareUrl_ = useGetState(twitterShareUrl)

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
          `/dashboard/${subdomain}/editor?id=${createPage.data
            ?.noteId}&type=${searchParams?.get("type")}`,
        )
      }
      const modalId = "publish-modal"
      present({
        title: `🎉 ${t("Published!")}`,
        id: modalId,
        content: (props) => (
          <PublishedModal
            postUrl={getPostUrl()}
            transactionUrl={getTransactionUrl()}
            twitterShareUrl={getTwitterShareUrl_()}
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

  useEffect(() => {
    if (!page.data || !draftKey) return
    setInitialContent(page.data.metadata?.content?.content || "")
    useEditorState.setState({
      title: page.data.metadata?.content?.title || "",
      publishedAt: page.data.metadata?.content?.date_published,
      published: !!page.data.noteId,
      excerpt: page.data.metadata?.content?.summary || "",
      slug: page.data.metadata?.content?.slug || "",
      tags:
        page.data.metadata?.content?.tags
          ?.filter((tag) => tag !== "post" && tag !== "page")
          ?.join(", ") || "",
      content: page.data.metadata?.content?.content || "",
      cover: page.data.metadata?.content?.attachments?.find(
        (attachment) => attachment.name === "cover",
      ) || {
        address: "",
        mime_type: "",
      },
      disableAISummary: page.data.metadata?.content?.disableAISummary,
    })
    setDefaultSlug(
      getDefaultSlug(
        page.data.metadata?.content?.title || "",
        draftKey.replace(`draft-${site.data?.characterId}-`, ""),
      ),
    )
  }, [page.data, subdomain, draftKey, site.data?.characterId])

  const [currentScrollArea, setCurrentScrollArea] = useState<string>("")
  const [view, setView] = useState<EditorView>()
  const [tree, setTree] = useState<Root | null>()

  // preview

  const [parsedContent, setParsedContent] = useState<Rendered | undefined>()

  useDebounceEffect(
    () => {
      const result = renderPageContent(values.content)
      setTree(result.tree)
      setParsedContent(result)
    },
    [values.content],
    {
      wait: 500,
    },
  )

  const previewRef = useRef<HTMLDivElement>(null)

  // editor
  const onCreateEditor = useCallback(
    (view: EditorView) => {
      setView?.(view)
    },
    [setView],
  )

  const onChange = useCallback(
    (value: string) => {
      updateValue("content", value)
    },
    [updateValue],
  )

  const handleDropFile = useCallback(
    async (file: File) => {
      if (view) {
        editorUpload(file, view)
      }
    },
    [uploadFile, view],
  )

  const computedPosition = useCallback(() => {
    let previewChildNodes = previewRef.current?.childNodes[0]?.childNodes
    const editorElementList: number[] = []
    const previewElementList: number[] = []
    if (view?.state && previewChildNodes) {
      tree?.children.forEach((child, index) => {
        if (
          child.position &&
          previewChildNodes?.[index] &&
          (child as any).tagName !== "style"
        ) {
          if (child.position.start.line > view.state.doc.lines) return
          const line = view.state?.doc.line(child.position.start.line)
          const block = view.lineBlockAt(line.from)
          if (block) {
            editorElementList.push(block.top)
            previewElementList.push(
              (previewChildNodes[index] as HTMLElement).offsetTop,
            )
          }
        }
      })
    }
    return {
      editorElementList,
      previewElementList,
    }
  }, [view, tree])

  const onScroll = useCallback(
    (scrollTop: number, area: string) => {
      if (
        currentScrollArea === area &&
        previewRef.current?.parentElement &&
        view
      ) {
        const position = computedPosition()

        let selfElement
        let selfPosition
        let targetElement
        let targetPosition
        if (area === "preview") {
          selfElement = previewRef.current.parentElement
          selfPosition = position.previewElementList
          targetElement = view.scrollDOM
          targetPosition = position.editorElementList
        } else {
          selfElement = view.scrollDOM
          selfPosition = position.editorElementList
          targetElement = previewRef.current.parentElement
          targetPosition = position.previewElementList
        }

        let scrollElementIndex = 0
        for (let i = 0; i < selfPosition.length; i++) {
          if (scrollTop < selfPosition[i]) {
            scrollElementIndex = i - 1
            break
          }
        }

        // scroll to bottom
        if (scrollTop >= selfElement.scrollHeight - selfElement.clientHeight) {
          targetElement.scrollTop =
            targetElement.scrollHeight - targetElement.clientHeight
          return
        }

        // scroll to position
        if (scrollElementIndex >= 0) {
          let ratio =
            (scrollTop - selfPosition[scrollElementIndex]) /
            (selfPosition[scrollElementIndex + 1] -
              selfPosition[scrollElementIndex])
          targetElement.scrollTop =
            ratio *
              (targetPosition[scrollElementIndex + 1] -
                targetPosition[scrollElementIndex]) +
            targetPosition[scrollElementIndex]
        }
      }
    },
    [view, computedPosition, currentScrollArea],
  )

  const onEditorScroll = useCallback(
    (scrollTop: number) => {
      onScroll(scrollTop, "editor")
    },
    [onScroll],
  )

  const onPreviewScroll = useCallback(
    (scrollTop: number) => {
      onScroll(scrollTop, "preview")
    },
    [onScroll],
  )

  const onPreviewButtonClick = useCallback(() => {
    window.open(
      `/site/${subdomain}/preview/${draftKey.replace(
        `draft-${site.data?.characterId}-`,
        "",
      )}`,
    )
  }, [draftKey, subdomain, site.data?.characterId])

  const presentAdvancedModal = useEditorAdvancedModal({ isPost })
  const extraProperties = (
    <EditorExtraProperties
      defaultSlug={defaultSlug}
      updateValue={updateValue}
      isPost={isPost}
      subdomain={subdomain}
      userTags={userTags.data?.list || []}
      openAdvancedOptions={presentAdvancedModal}
    />
  )

  const discardChanges = useCallback(() => {
    if (draftKey) {
      delStorage(draftKey)
      queryClient.invalidateQueries(["getPagesBySite", site.data?.characterId])
      page.remove()
      page.refetch()
    }
  }, [draftKey, site.data?.characterId])

  const cmStyle = useMemo(
    () => ({
      ".cm-scroller": {
        padding: "0 1.25rem",
      },
      ".cm-content": {
        paddingBottom: "600px",
      },
    }),
    [],
  )

  return (
    <>
      <DashboardMain fullWidth>
        {page.isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            {t("Loading")}...
          </div>
        ) : (
          <>
            <header
              className={`flex justify-between absolute top-0 left-0 right-0 z-25 px-5 h-14 border-b items-center text-sm ${
                isMobileLayout ? "w-screen" : undefined
              }`}
            >
              <div
                className={`flex items-center overflow-x-auto scrollbar-hide ${
                  isMobileLayout ? "flex-1" : undefined
                }`}
              >
                <EditorToolbar view={view} toolbars={toolbars}></EditorToolbar>
              </div>
              {isMobileLayout ? (
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
                    isPost={isPost}
                    isModified={visibility === PageVisibilityEnum.Modified}
                    discardChanges={discardChanges}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-3 flex-shrink-0">
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
                    isPost={isPost}
                    isModified={visibility === PageVisibilityEnum.Modified}
                    discardChanges={discardChanges}
                  />
                </div>
              )}
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
                    onChange={(e) => updateValue("title", e.target.value)}
                    className="h-12 ml-1 inline-flex items-center border-none text-3xl font-bold w-full focus:outline-none bg-white"
                    placeholder={t("Title goes here...") || ""}
                  />
                </div>
                <div className="mt-5 flex-1 min-h-0 flex relative items-center">
                  {!(isMobileLayout && isRendering) && (
                    <CodeMirrorEditor
                      value={initialContent}
                      placeholder={t("Start writing...") as string}
                      onChange={onChange}
                      handleDropFile={handleDropFile}
                      onScroll={onEditorScroll}
                      cmStyle={cmStyle}
                      onCreateEditor={onCreateEditor}
                      onMouseEnter={() => {
                        setCurrentScrollArea("editor")
                      }}
                      className={cn(
                        "h-full flex-1",
                        isRendering ? "border-r" : "",
                      )}
                      shortcuts={toolbarShortcuts}
                    />
                  )}
                  {!isMobileLayout && (
                    <div className="z-10 w-[1px]">
                      <div
                        aria-label="Toggle preview view"
                        className="bg-accent rounded-full cursor-pointer text-white w-6 h-6 -translate-x-1/2"
                        onClick={() => setIsRendering(!isRendering)}
                      >
                        {isRendering ? (
                          <i className="icon-[mingcute--right-line] text-2xl inline-block w-6 h-6" />
                        ) : (
                          <i className="icon-[mingcute--left-line] text-2xl inline-block w-6 h-6" />
                        )}
                      </div>
                    </div>
                  )}
                  {isRendering && (
                    <DynamicPageContent
                      className="bg-white px-5 overflow-scroll pb-[200px] h-full flex-1"
                      parsedContent={parsedContent}
                      inputRef={previewRef}
                      onScroll={onPreviewScroll}
                      onMouseEnter={() => {
                        setCurrentScrollArea("preview")
                      }}
                    />
                  )}
                </div>
              </div>
              {!isMobileLayout && (
                <EditorExtraProperties
                  defaultSlug={defaultSlug}
                  updateValue={updateValue}
                  isPost={isPost}
                  userTags={userTags.data?.list || []}
                  subdomain={subdomain}
                  openAdvancedOptions={presentAdvancedModal}
                />
              )}
            </div>
          </>
        )}
      </DashboardMain>
    </>
  )
}

const EditorExtraProperties = memo(
  ({
    isPost,
    updateValue,
    subdomain,
    defaultSlug,
    userTags,
    openAdvancedOptions,
  }: {
    updateValue: <K extends keyof Values>(key: K, value: Values[K]) => void
    isPost: boolean

    subdomain: string
    defaultSlug: string
    userTags: string[]

    openAdvancedOptions: () => void
  }) => {
    const values = useEditorState(
      (state) =>
        pick(state, ["publishedAt", "slug", "excerpt", "tags", "cover"]),
      shallow,
    )
    const { t } = useTranslation("dashboard")
    const site = useGetSite(subdomain)

    return (
      <div className="h-full overflow-auto w-[280px] border-l bg-zinc-50 p-5 space-y-5">
        <div>
          <FieldLabel label={t("Cover Image")} />
          <ImageUploader
            id="icon"
            className="aspect-video rounded-lg"
            value={values.cover as any}
            hasClose={true}
            withMimeType={true}
            uploadEnd={(key) => {
              const { address, mime_type } = key as {
                address?: string
                mime_type?: string
              }
              updateValue("cover", {
                address,
                mime_type,
              })
            }}
            accept="image/*"
          />
          <div className="text-xs text-gray-400 mt-1">
            {t("Leave blank to use the first image in the post")}
          </div>
        </div>
        <div>
          <Input
            name="tags"
            value={values.tags}
            label={t("Tags") || ""}
            id="tags"
            isBlock
            renderInput={(props) => (
              <TagInput
                {...props}
                userTags={userTags}
                onTagChange={(value: string) => updateValue("tags", value)}
              />
            )}
          />
        </div>
        <div>
          <Input
            name="slug"
            value={values.slug}
            placeholder={defaultSlug}
            label={t(`${isPost ? "Post" : "Page"} slug`) || ""}
            id="slug"
            isBlock
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateValue("slug", e.target.value)
            }
            help={
              <>
                {(values.slug || defaultSlug) && (
                  <>
                    {t(
                      `This ${isPost ? "post" : "page"} will be accessible at`,
                    )}{" "}
                    <UniLink
                      href={`${getSiteLink({
                        subdomain,
                        domain: site.data?.metadata?.content?.custom_domain,
                      })}/${encodeURIComponent(values.slug || defaultSlug)}`}
                      className="hover:underline"
                    >
                      {getSiteLink({
                        subdomain,
                        domain: site.data?.metadata?.content?.custom_domain,
                        noProtocol: true,
                      })}
                      /{encodeURIComponent(values.slug || defaultSlug)}
                    </UniLink>
                  </>
                )}
              </>
            }
          />
        </div>
        <div>
          <Input
            label={t("Excerpt") || ""}
            isBlock
            name="excerpt"
            id="excerpt"
            value={values.excerpt}
            multiline
            rows={4}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              updateValue("excerpt", e.target.value)
            }}
            help={t("Leave it blank to use auto-generated excerpt")}
          />
        </div>
        <div>
          <Button
            variant="secondary"
            className="border"
            type="button"
            isBlock
            onClick={openAdvancedOptions}
          >
            <span className="inline-flex items-center">
              <i className="icon-[mingcute--settings-4-fill] inline-block mr-2" />
              <span>{t("Advanced Settings")}</span>
            </span>
          </Button>
        </div>
      </div>
    )
  },
)

EditorExtraProperties.displayName = "EditorExtraProperties"

const useEditorAdvancedModal = ({ isPost }: { isPost: boolean }) => {
  const { t } = useTranslation("dashboard")

  const { present } = useModalStack()

  return () => {
    present({
      title: t("Advanced Settings"),
      content: () => <EditorAdvancedModal isPost={isPost} />,
    })
  }
}

const EditorAdvancedModal: FC<{
  isPost: boolean
}> = ({ isPost }) => {
  const { t } = useTranslation("dashboard")

  const values = useEditorState(
    (state) => pick(state, ["disableAISummary", "publishedAt"]),
    shallow,
  )
  const updateValue = useEditorState.setState
  return (
    <div className="p-5 space-y-5">
      <div>
        <label className="form-label">
          {t("Disable AI-generated summary")}
        </label>
        <Switch
          label=""
          checked={values.disableAISummary}
          // setChecked={(state) => updateValue("disableAISummary", state)}
          setChecked={(state) => {
            updateValue({
              disableAISummary: state,
            })
          }}
        />
      </div>
      <div>
        <label className="form-label" htmlFor="publishAt">
          {t("Publish at")}
        </label>
        <DateInput
          className="[&_input]:bg-slate-50 [&_input]:text-black/90"
          allowDeselect
          clearable
          valueFormat="YYYY-MM-DD, h:mm a"
          name="publishAt"
          id="publishAt"
          value={values.publishedAt ? new Date(values.publishedAt) : undefined}
          onChange={(value: Date | null) => {
            if (value) {
              updateValue({
                publishedAt: value.toISOString(),
              })
            } else {
              updateValue({
                publishedAt: "",
              })
            }
          }}
          styles={{
            input: {
              borderRadius: "0.5rem",
              borderColor: "var(--border-color)",
              height: "2.5rem",
              "&:focus-within": {
                borderColor: "var(--theme-color)",
              },
            },
          }}
        />
        <div className="text-xs text-gray-400 mt-1">
          {t(
            `This ${
              isPost ? "post" : "page"
            } will be accessible from this time. Leave blank to use the current time.`,
          )}
        </div>
        {values.publishedAt > new Date().toISOString() && (
          <div className="text-xs mt-1 text-orange-500">
            {t(
              "The post is currently not public as its publication date has been scheduled for a future time.",
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const PublishedModal = ({
  dismiss,
  postUrl,
  transactionUrl,
  twitterShareUrl,
}: ModalContentProps<{
  postUrl: string
  transactionUrl: string
  twitterShareUrl: string
}>) => {
  const { t } = useTranslation("dashboard")
  return (
    <>
      <div className="p-5">
        {t(
          "Your post has been securely stored on the blockchain. Now you may want to",
        )}
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <UniLink className="text-accent" href={postUrl}>
              {t("View the post")}
            </UniLink>
          </li>
          <li>
            <UniLink className="text-accent" href={transactionUrl}>
              {t("View the transaction")}
            </UniLink>
          </li>
          <li>
            <UniLink className="text-accent" href={twitterShareUrl}>
              {t("Share to Twitter")}
            </UniLink>
          </li>
        </ul>
      </div>
      <div className="h-16 border-t flex items-center px-5">
        <Button isBlock onClick={() => dismiss()}>
          {t("Got it, thanks!")}
        </Button>
      </div>
    </>
  )
}
