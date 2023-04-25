import { useDebounceEffect } from "ahooks"
import type { Root } from "mdast"
import { nanoid } from "nanoid"
import { GetServerSideProps } from "next"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import NodeID3 from "node-id3"
import {
  ChangeEvent,
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import type { ReactElement } from "react"
import toast from "react-hot-toast"
import { create } from "zustand"
import { shallow } from "zustand/shallow"

import type { EditorView } from "@codemirror/view"
import { useQueryClient } from "@tanstack/react-query"

import { PageContent } from "~/components/common/PageContent"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { OptionsButton } from "~/components/dashboard/OptionsButton"
import { PublishButton } from "~/components/dashboard/PublishButton"
import { Button } from "~/components/ui/Button"
import { CodeMirrorEditor } from "~/components/ui/CodeMirror"
import { EditorToolbar } from "~/components/ui/EditorToolbar"
import { Input } from "~/components/ui/Input"
import { Modal } from "~/components/ui/Modal"
import { UniLink } from "~/components/ui/UniLink"
import { toolbars } from "~/editor"
import { useDate } from "~/hooks/useDate"
import { useGetState } from "~/hooks/useGetState"
import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { useSyncOnce } from "~/hooks/useSyncOnce"
import { useUploadFile } from "~/hooks/useUploadFile"
import { showConfetti } from "~/lib/confetti"
import { getDefaultSlug } from "~/lib/default-slug"
import { CSB_SCAN } from "~/lib/env"
import { getSiteLink, getTwitterShareUrl } from "~/lib/helpers"
import { getPageVisibility } from "~/lib/page-helpers"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { delStorage, setStorage } from "~/lib/storage"
import { PageVisibilityEnum } from "~/lib/types"
import { cn, pick } from "~/lib/utils"
import { Rendered, renderPageContent } from "~/markdown"
import { checkPageSlug } from "~/models/page.model"
import { useCreateOrUpdatePage, useGetPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const { props: layoutProps } = await getLayoutServerSideProps(ctx)

    return {
      props: {
        ...layoutProps,
      },
    }
  },
)

const getInputDatetimeValue = (date: Date | string, dayjs: any) => {
  const str = dayjs(date).format()
  return str.substring(0, ((str.indexOf("T") | 0) + 6) | 0)
}

const initialEditorState = {
  title: "",
  publishedAt: new Date().toISOString(),
  published: false,
  excerpt: "",
  slug: "",
  tags: "",
  content: "",
}

const useEditorState = create<
  typeof initialEditorState & {
    setValues: (values: Partial<typeof initialEditorState>) => void
  }
>((set) => ({
  ...initialEditorState,
  setValues: (values: any) => set(values),
}))

type Values = typeof initialEditorState

export default function SubdomainEditor() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { t } = useTranslation("dashboard")

  let pageId = router.query.id as string | undefined
  const subdomain = router.query.subdomain as string
  const isPost = router.query.type === "post"

  const [draftKey, setDraftKey] = useState<string>("")
  useEffect(() => {
    if (subdomain) {
      let key
      if (!pageId) {
        const randomId = nanoid()
        key = `draft-${subdomain}-local-${randomId}`
        setDraftKey(key)
        queryClient.invalidateQueries(["getPagesBySite", subdomain])
        router.replace(
          `/dashboard/${subdomain}/editor?id=local-${randomId}&type=${router.query.type}`,
        )
      } else {
        key = `draft-${subdomain}-${pageId}`
      }
      setDraftKey(key)
      setDefaultSlug(
        key
          .replace(`draft-${subdomain}-local-`, "")
          .replace(`draft-${subdomain}-`, ""),
      )
    }
  }, [subdomain, pageId, queryClient, router])

  const site = useGetSite(subdomain)

  const page = useGetPage({
    site: subdomain!,
    pageId: pageId || draftKey.replace(`draft-${subdomain}-`, ""),
  })

  const [visibility, setVisibility] = useState<PageVisibilityEnum>()

  useEffect(() => {
    if (page.isSuccess) {
      setVisibility(
        page.data ? getPageVisibility(page.data) : PageVisibilityEnum.Draft,
      )
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
      if (!visibility || visibility === PageVisibilityEnum.Published) {
        setVisibility(PageVisibilityEnum.Modified)
      }

      const values = getValues()
      const draftKey = getDraftKey()
      if (key === "title") {
        setDefaultSlug(
          getDefaultSlug(
            value as string,
            draftKey.replace(`draft-${subdomain}-`, ""),
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
        queryClient.invalidateQueries(["getPagesBySite", subdomain])
      }
      useEditorState.setState(newValues)
    },
    [isPost, queryClient, subdomain],
  )

  const createOrUpdatePage = useCreateOrUpdatePage()

  const isMobileLayout = useIsMobileLayout()
  const [isRendering, setIsRendering] = useState(false)

  const savePage = async (published: boolean) => {
    const check = await checkPageSlug({
      slug: values.slug || defaultSlug,
      site: subdomain,
      pageId: pageId,
    })
    if (check) {
      toast.error(check)
    } else {
      createOrUpdatePage.mutate({
        ...values,
        slug: values.slug || defaultSlug,
        siteId: subdomain,
        ...(visibility === PageVisibilityEnum.Draft ? {} : { pageId: pageId }),
        isPost: isPost,
        published,
        externalUrl:
          (values.slug || defaultSlug) &&
          `${getSiteLink({
            subdomain,
            domain: site.data?.custom_domain,
          })}/${encodeURIComponent(values.slug || defaultSlug)}`,
        applications: page.data?.applications,
      })
    }
  }

  const [isCheersOpen, setIsCheersOpen] = useState(false)

  useEffect(() => {
    if (createOrUpdatePage.isSuccess) {
      if (createOrUpdatePage.data?.code === 0) {
        if (draftKey) {
          delStorage(draftKey)
          queryClient.invalidateQueries(["getPagesBySite", subdomain])
          queryClient.invalidateQueries([
            "getPage",
            draftKey.replace(`draft-${subdomain}-`, ""),
          ])
        } else {
          queryClient.invalidateQueries(["getPage", pageId])
        }

        if (createOrUpdatePage.data.data) {
          router.replace(
            `/dashboard/${subdomain}/editor?id=${site.data?.metadata?.proof}-${createOrUpdatePage.data.data}&type=${router.query.type}`,
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
    setInitialContent(page.data.body?.content || "")
    useEditorState.setState({
      title: page.data.title || "",
      publishedAt: page.data.date_published,
      published: !!page.data.id,
      excerpt: page.data.summary?.content || "",
      slug: page.data.slug || "",
      tags:
        page.data.tags
          ?.filter((tag) => tag !== "post" && tag !== "page")
          ?.join(", ") || "",
      content: page.data.body?.content || "",
    })
    setDefaultSlug(
      getDefaultSlug(
        page.data.title || "",
        draftKey.replace(`draft-${subdomain}-`, ""),
      ),
    )
  }, [page.data, subdomain, draftKey])

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
      const toastId = toast.loading("Uploading...")
      try {
        if (
          !file.type.startsWith("image/") &&
          !file.type.startsWith("audio/")
        ) {
          throw new Error("You can only upload images and audios")
        }

        const { key } = await uploadFile(file)
        toast.success("Uploaded!", {
          id: toastId,
        })
        if (file.type.startsWith("image/")) {
          view?.dispatch(
            view.state.replaceSelection(
              `\n![${file.name.replace(/\.\w+$/, "")}](${key})\n`,
            ),
          )
        } else if (file.type.startsWith("audio/")) {
          const fileArrayBuffer = await file.arrayBuffer()
          const fileBuffer = Buffer.from(fileArrayBuffer)
          const tags = NodeID3.read(fileBuffer)
          const name = tags.title ?? file.name
          const artist = tags.artist
          const cover = await (async () => {
            const image = tags.image
            if (!image || typeof image === "string") return image

            const toastId = toast.loading("Uploading cover...")
            const { key } = await uploadFile(
              new Blob([image.imageBuffer], { type: image.type.name }),
            )
            toast.success("Uploaded cover!", {
              id: toastId,
            })
            return key
          })()
          view?.dispatch(
            view.state.replaceSelection(
              `\n<audio src="${key}" name="${name}" ${
                artist ? `artist="${artist}"` : ""
              } ${cover ? `cover="${cover}"` : ""}><audio>\n`,
            ),
          )
        } else if (file.type === "text/plain") {
          view?.dispatch(view.state.replaceSelection(key))
        } else {
          throw new Error("Unknown upload file type")
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message, { id: toastId })
        }
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
      `/_site/${subdomain}/preview/${draftKey.replace(
        `draft-${subdomain}-`,
        "",
      )}`,
    )
  }, [draftKey, subdomain])
  const extraProperties = (
    <EditorExtraProperties
      defaultSlug={defaultSlug}
      updateValue={updateValue}
      isPost={isPost}
      subdomain={subdomain}
    />
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
                    published={visibility !== PageVisibilityEnum.Draft}
                    isRendering={isRendering}
                    renderPage={setIsRendering}
                    propertiesWidget={extraProperties}
                    previewPage={onPreviewButtonClick}
                    isPost={isPost}
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
              <div className="h-full overflow-auto w-full">
                <div className="h-full mx-auto pt-5 flex flex-col">
                  <div className="px-5 h-12">
                    <input
                      type="text"
                      name="title"
                      value={values.title}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          view?.focus()
                        }
                      }}
                      onChange={(e) => updateValue("title", e.target.value)}
                      className="h-12 ml-1 inline-flex items-center border-none text-3xl font-bold w-full focus:outline-none bg-white"
                      placeholder={t("Title goes here...") || ""}
                    />
                  </div>
                  <div className="mt-5 flex-1 flex overflow-hidden">
                    {isMobileLayout ? (
                      !isRendering ? (
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
                        />
                      ) : (
                        <PageContent
                          className={`px-5 overflow-scroll pb-[200px] ${
                            isMobileLayout ? "" : "w-1/2 "
                          }`}
                          parsedContent={parsedContent}
                          inputRef={previewRef}
                          onScroll={onPreviewScroll}
                          onMouseEnter={() => {
                            setCurrentScrollArea("preview")
                          }}
                        ></PageContent>
                      )
                    ) : (
                      <>
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
                        />
                        <PageContent
                          className={`px-5 overflow-scroll pb-[200px] ${
                            isMobileLayout ? "" : "w-1/2 "
                          }`}
                          parsedContent={parsedContent}
                          inputRef={previewRef}
                          onScroll={onPreviewScroll}
                          onMouseEnter={() => {
                            setCurrentScrollArea("preview")
                          }}
                        ></PageContent>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {!isMobileLayout && (
                <EditorExtraProperties
                  defaultSlug={defaultSlug}
                  updateValue={updateValue}
                  isPost={isPost}
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
                  domain: site.data?.custom_domain,
                })}/${encodeURIComponent(values.slug || defaultSlug)}`}
              >
                {t("View the post")}
              </UniLink>
            </li>
            <li>
              <UniLink
                className="text-accent"
                href={
                  page.data?.metadata?.transactions &&
                  `${CSB_SCAN}/tx/${
                    page.data?.metadata?.transactions[1] ||
                    page.data?.metadata?.transactions[0]
                  }`
                }
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

SubdomainEditor.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Editor">{page}</DashboardLayout>
}

const EditorExtraProperties: FC<{
  updateValue: <K extends keyof Values>(key: K, value: Values[K]) => void
  isPost: boolean

  subdomain: string
  defaultSlug: string
}> = memo(({ isPost, updateValue, subdomain, defaultSlug }) => {
  const values = useEditorState(
    (state) => pick(state, ["publishedAt", "slug", "excerpt", "tags"]),
    shallow,
  )
  const date = useDate()
  const { t } = useTranslation("dashboard")
  const site = useGetSite(subdomain)

  return (
    <div className="h-full overflow-auto flex-shrink-0 w-[280px] border-l bg-zinc-50 p-5 space-y-5">
      <div>
        <Input
          type="datetime-local"
          label={t("Publish at") || ""}
          isBlock
          name="publishAt"
          id="publishAt"
          value={getInputDatetimeValue(values.publishedAt, date.dayjs)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            try {
              const value = date.inLocalTimezone(e.target.value).toISOString()
              updateValue("publishedAt", value)
            } catch (error) {}
          }}
          help={t(
            `This ${
              isPost ? "post" : "page"
            } will be accessible from this time`,
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
                  {t(`This ${isPost ? "post" : "page"} will be accessible at`)}{" "}
                  <UniLink
                    href={`${getSiteLink({
                      subdomain,
                      domain: site.data?.custom_domain,
                    })}/${encodeURIComponent(values.slug || defaultSlug)}`}
                    className="hover:underline"
                  >
                    {getSiteLink({
                      subdomain,
                      domain: site.data?.custom_domain,
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
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateValue("tags", e.target.value)
          }
          help={t("Separate multiple tags with English commas") + ` ","`}
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
