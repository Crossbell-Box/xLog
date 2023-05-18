"use client"

import { useDebounceEffect } from "ahooks"
import type { Root } from "mdast"
import { nanoid } from "nanoid"
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

import { PageContent } from "~/components/common/PageContent"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { OptionsButton } from "~/components/dashboard/OptionsButton"
import { PublishButton } from "~/components/dashboard/PublishButton"
import { Button } from "~/components/ui/Button"
import { CodeMirrorEditor } from "~/components/ui/CodeMirror"
import { EditorToolbar } from "~/components/ui/EditorToolbar"
import { Input } from "~/components/ui/Input"
import { Modal } from "~/components/ui/Modal"
import { TagInput } from "~/components/ui/TagInput"
import { UniLink } from "~/components/ui/UniLink"
import { toolbars } from "~/editor"
import { editorUpload } from "~/editor/Multimedia"
import {
  Values,
  initialEditorState,
  useEditorState,
} from "~/hooks/useEdtiorState"
import { useGetState } from "~/hooks/useGetState"
import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { useSyncOnce } from "~/hooks/useSyncOnce"
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
  useCreateOrUpdatePage,
  useGetPage,
  useGetPagesBySiteLite,
} from "~/queries/page"
import { useGetSite } from "~/queries/site"

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

  const { data: posts = { pages: [] } } = useGetPagesBySiteLite({
    characterId: site.data?.characterId,
    limit: 100,
    type: "post",
    visibility: PageVisibilityEnum.Published,
  })

  const userTags = useMemo(() => {
    const result = new Set<string>()

    if (posts?.pages?.length) {
      for (const page of posts.pages) {
        for (const post of page.list) {
          post.metadata?.content?.tags?.forEach((tag) => {
            if (tag !== "post" && tag !== "page") {
              result.add(tag)
            }
          })
        }
      }
    }
    return Array.from(result)
  }, [posts.pages])

  const [visibility, setVisibility] = useState<PageVisibilityEnum>()

  useEffect(() => {
    if (page.isSuccess) {
      setVisibility(getPageVisibility(page.data || undefined))
    }
  }, [page.isSuccess, page.data])

  const uploadFile = useUploadFile()

  // reset editor state when page changes
  useSyncOnce(() => {
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
        toast.error(
          t(
            "Slug can only contain letters, numbers, hyphens, and underscores.",
          ),
        )
        return
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

  const createOrUpdatePage = useCreateOrUpdatePage()

  const isMobileLayout = useIsMobileLayout()
  const [isRendering, setIsRendering] = useState(!isMobileLayout)

  const savePage = async (published: boolean) => {
    const check = await checkPageSlug({
      slug: values.slug || defaultSlug,
      characterId: site.data?.characterId,
      noteId: page?.data?.noteId,
    })
    if (check) {
      toast.error(check)
    } else {
      const uniqueTags = Array.from(new Set(values.tags.split(","))).join(",")
      createOrUpdatePage.mutate({
        ...values,
        tags: uniqueTags,
        slug: values.slug || defaultSlug,
        siteId: subdomain,
        ...(visibility === PageVisibilityEnum.Draft
          ? {}
          : { pageId: `${page?.data?.characterId}-${page?.data?.noteId}` }),
        isPost: isPost,
        published,
        externalUrl:
          (values.slug || defaultSlug) &&
          `${getSiteLink({
            subdomain,
            domain: site.data?.metadata?.content?.custom_domain,
          })}/${encodeURIComponent(values.slug || defaultSlug)}`,
        applications: page.data?.metadata?.content?.sources,
        characterId: site.data?.characterId,
      })
    }
  }

  const [isCheersOpen, setIsCheersOpen] = useState(false)

  useEffect(() => {
    if (createOrUpdatePage.isSuccess) {
      if (createOrUpdatePage.data?.code === 0) {
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

        if (createOrUpdatePage.data.data) {
          router.replace(
            `/dashboard/${subdomain}/editor?id=${site.data?.characterId}-${
              createOrUpdatePage.data.data
            }&type=${searchParams?.get("type")}`,
          )
        }

        setIsCheersOpen(true)
        showConfetti()
      } else {
        toast.error("Error: " + createOrUpdatePage.data?.message)
      }
    }
  }, [createOrUpdatePage.isSuccess])

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

  const extraProperties = (
    <EditorExtraProperties
      defaultSlug={defaultSlug}
      updateValue={updateValue}
      isPost={isPost}
      subdomain={subdomain}
      userTags={userTags}
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
                    save={savePage}
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
                    isSaving={createOrUpdatePage.isLoading}
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
                      onChange={onChange}
                      handleDropFile={handleDropFile}
                      onScroll={onEditorScroll}
                      // onUpdate={onUpdate}
                      onCreateEditor={onCreateEditor}
                      onMouseEnter={() => {
                        setCurrentScrollArea("editor")
                      }}
                      className={cn("flex-1", isRendering ? "border-r" : "")}
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
                    <PageContent
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
                  userTags={userTags}
                  subdomain={subdomain}
                />
              )}
            </div>
          </>
        )}
      </DashboardMain>
      <Modal
        open={isCheersOpen}
        setOpen={setIsCheersOpen}
        title={`🎉 ${t("Published!")}`}
      >
        <div className="p-5">
          {t(
            "Your post has been securely stored on the blockchain. Now you may want to",
          )}
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <UniLink
                className="text-accent"
                href={`${getSiteLink({
                  subdomain,
                  domain: site.data?.metadata?.content?.custom_domain,
                })}/${encodeURIComponent(values.slug || defaultSlug)}`}
              >
                {t("View the post")}
              </UniLink>
            </li>
            <li>
              <UniLink
                className="text-accent"
                href={`${CSB_SCAN}/tx/${
                  page.data?.updatedTransactionHash ||
                  page.data?.transactionHash
                }`}
              >
                {t("View the transaction")}
              </UniLink>
            </li>
            <li>
              <UniLink
                className="text-accent"
                href={
                  page.data && site.data
                    ? getTwitterShareUrl({
                        page: page.data,
                        site: site.data,
                        t,
                      })
                    : ""
                }
              >
                {t("Share to Twitter")}
              </UniLink>
            </li>
          </ul>
        </div>
        <div className="h-16 border-t flex items-center px-5">
          <Button isBlock onClick={() => setIsCheersOpen(false)}>
            {t("Got it, thanks!")}
          </Button>
        </div>
      </Modal>
    </>
  )
}

const EditorExtraProperties: FC<{
  updateValue: <K extends keyof Values>(key: K, value: Values[K]) => void
  isPost: boolean

  subdomain: string
  defaultSlug: string
  userTags: string[]
}> = memo(({ isPost, updateValue, subdomain, defaultSlug, userTags }) => {
  const values = useEditorState(
    (state) => pick(state, ["publishedAt", "slug", "excerpt", "tags"]),
    shallow,
  )
  const { t } = useTranslation("dashboard")
  const site = useGetSite(subdomain)

  return (
    <div className="h-full overflow-auto w-[280px] border-l bg-zinc-50 p-5 space-y-5">
      <div>
        <label className="form-label" htmlFor="publishAt">
          {t("Publish at")}
        </label>
        <DateInput
          className=""
          allowDeselect
          clearable
          valueFormat="YYYY-MM-DD, h:mm a"
          name="publishAt"
          id="publishAt"
          value={values.publishedAt ? new Date(values.publishedAt) : undefined}
          onChange={(value: Date | null) => {
            if (value) {
              updateValue("publishedAt", value.toISOString())
            } else {
              updateValue("publishedAt", "")
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
          <div className="text-xs mt-1 text-red-500">
            {t(
              "The post is currently unavailable as its publication date has been scheduled for a future time.",
            )}
          </div>
        )}
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
                  {t(`This ${isPost ? "post" : "page"} will be accessible at`)}{" "}
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
          label={t("Excerpt") || ""}
          isBlock
          name="excerpt"
          id="excerpt"
          value={values.excerpt}
          multiline
          rows={5}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            updateValue("excerpt", e.target.value)
          }}
          help={t("Leave it blank to use auto-generated excerpt")}
        />
      </div>
    </div>
  )
})

EditorExtraProperties.displayName = "EditorExtraProperties"
