import { cn } from "~/lib/utils"
import { useDate } from "~/hooks/useDate"
import { useRouter } from "next/router"
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react"
import toast from "react-hot-toast"
import { toolbars } from "~/editor"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { PublishButton } from "~/components/dashboard/PublishButton"
import { EditorToolbar } from "~/components/ui/EditorToolbar"
import { Input } from "~/components/ui/Input"
import { UniLink } from "~/components/ui/UniLink"
import { useUploadFile } from "~/hooks/useUploadFile"
import { getSiteLink } from "~/lib/helpers"
import { getPageVisibility } from "~/lib/page-helpers"
import { PageVisibilityEnum } from "~/lib/types"
import { useGetPage, useCreateOrUpdatePage } from "~/queries/page"
import { checkPageSlug } from "~/models/page.model"
import { useGetSite } from "~/queries/site"
import { setStorage, delStorage } from "~/lib/storage"
import { nanoid } from "nanoid"
import { useQueryClient } from "@tanstack/react-query"
import { PageContent } from "~/components/common/PageContent"
import type { Root } from "hast"
import type { EditorView } from "@codemirror/view"
import { Editor } from "~/components/ui/Editor"
import { renderPageContent } from "~/markdown"
import { Button } from "~/components/ui/Button"
import { Modal } from "~/components/ui/Modal"
import { CSB_SCAN } from "~/lib/env"
import { showConfetti } from "~/lib/confetti"
import type { ReactElement } from "react"
import { useTranslation } from "next-i18next"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { GetServerSideProps } from "next"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { getDefaultSlug } from "~/lib/helpers"
import { useMobileLayout } from "~/hooks/useMobileLayout"
import { OptionsButton } from "~/components/dashboard/OptionsButton"

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

export default function SubdomainEditor() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const date = useDate()
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

  const [values, setValues] = useState({
    title: "",
    publishedAt: new Date().toISOString(),
    published: false,
    excerpt: "",
    slug: "",
    tags: "",
    content: "",
  })
  const [defaultSlug, setDefaultSlug] = useState("")

  type Values = typeof values

  const updateValue = useCallback(
    <K extends keyof Values>(key: K, value: Values[K]) => {
      if (visibility === PageVisibilityEnum.Published) {
        setVisibility(PageVisibilityEnum.Modified)
      }
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
      setValues(newValues)
    },
    [setValues, values, draftKey, isPost, queryClient, subdomain],
  )

  const createOrUpdatePage = useCreateOrUpdatePage()

  const isMobileLayout = useMobileLayout()
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

  const ExtraProperties = (
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

    setValues({
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
  const parsedContent = useMemo(() => {
    if (values.content) {
      const result = renderPageContent(values.content)
      setTree(result.tree)
      return result
    }
  }, [values.content])

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
        if (!file.type.startsWith("image/")) {
          throw new Error("You can only upload images")
        }

        const { key } = await uploadFile(file)
        toast.success("Uploaded!", {
          id: toastId,
        })
        view?.dispatch(
          view.state.replaceSelection(
            `\n![${file.name.replace(/\.\w+$/, "")}](${key})\n`,
          ),
        )
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
        let selfPostion
        let targetElement
        let targetPosition
        if (area === "preview") {
          selfElement = previewRef.current.parentElement
          selfPostion = position.previewElementList
          targetElement = view.scrollDOM
          targetPosition = position.editorElementList
        } else {
          selfElement = view.scrollDOM
          selfPostion = position.editorElementList
          targetElement = previewRef.current.parentElement
          targetPosition = position.previewElementList
        }

        let scrollElementIndex = 0
        for (let i = 0; i < selfPostion.length; i++) {
          if (scrollTop < selfPostion[i]) {
            scrollElementIndex = i - 1
            break
          }
        }

        // scroll to buttom
        if (scrollTop >= selfElement.scrollHeight - selfElement.clientHeight) {
          targetElement.scrollTop =
            targetElement.scrollHeight - targetElement.clientHeight
          return
        }

        // scroll to position
        if (scrollElementIndex >= 0) {
          let ratio =
            (scrollTop - selfPostion[scrollElementIndex]) /
            (selfPostion[scrollElementIndex + 1] -
              selfPostion[scrollElementIndex])
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
                className={`flex items-center ${
                  isMobileLayout
                    ? "flex-1 overflow-x-auto scrollbar-hide"
                    : undefined
                }`}
              >
                <EditorToolbar view={view} toolbars={toolbars}></EditorToolbar>
                <UniLink
                  className="ml-7 align-middle hidden xl:block"
                  href={`${getSiteLink({
                    subdomain: "xlog",
                  })}/xfm`}
                >
                  {t("Tip: xLog Flavored Markdown")}
                </UniLink>
              </div>
              {isMobileLayout ? (
                <div className="flex items-center space-x-3 w-auto inline-block pl-5">
                  {/* <span
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
                  </span> */}
                  {/* <Button
                    isAutoWidth
                    onClick={() => {
                      window.open(
                        `/_site/${subdomain}/preview/${draftKey.replace(
                          `draft-${subdomain}-`,
                          "",
                        )}`,
                      )
                    }}
                  >
                    {t("Preview")}
                  </Button> */}
                  {/* <PublishButton
                    save={savePage}
                    published={visibility !== PageVisibilityEnum.Draft}
                    isSaving={createOrUpdatePage.isLoading}
                    isDisabled={
                      visibility !== PageVisibilityEnum.Modified &&
                      visibility !== PageVisibilityEnum.Draft
                    }
                  /> */}
                  <OptionsButton
                    visibility={visibility}
                    savePage={savePage}
                    published={visibility !== PageVisibilityEnum.Draft}
                    isRendering={isRendering}
                    renderPage={setIsRendering}
                    propertiesWidget={ExtraProperties}
                    previewPage={() => {
                      window.open(
                        `/_site/${subdomain}/preview/${draftKey.replace(
                          `draft-${subdomain}-`,
                          "",
                        )}`,
                      )
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-3">
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
                  <Button
                    isAutoWidth
                    onClick={() => {
                      window.open(
                        `/_site/${subdomain}/preview/${draftKey.replace(
                          `draft-${subdomain}-`,
                          "",
                        )}`,
                      )
                    }}
                  >
                    {t("Preview")}
                  </Button>
                  <PublishButton
                    save={savePage}
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
                        <Editor
                          value={values.content}
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
                        <Editor
                          value={values.content}
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
              {!isMobileLayout && ExtraProperties}
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
                href={`https://twitter.com/intent/tweet?url=${getSiteLink({
                  subdomain,
                  domain: site.data?.custom_domain,
                })}/${encodeURIComponent(
                  values.slug || defaultSlug,
                )}&via=_xLog&text=${encodeURIComponent(
                  `Read my new post - ${page.data?.title}`,
                )}`}
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
