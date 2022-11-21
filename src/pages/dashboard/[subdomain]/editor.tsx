import clsx from "clsx"
import dayjs from "~/lib/date"
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
import { inLocalTimezone } from "~/lib/date"
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
import pinyin from "pinyin"
import type { Root } from "hast"
import type { EditorView } from "@codemirror/view"
import { Editor } from "~/components/ui/Editor"
import { renderPageContent } from "~/markdown"
import { Button } from "~/components/ui/Button"

const getInputDatetimeValue = (date: Date | string) => {
  const str = dayjs(date).format()
  return str.substring(0, ((str.indexOf("T") | 0) + 6) | 0)
}

export default function SubdomainEditor() {
  const router = useRouter()
  const queryClient = useQueryClient()

  let pageId = router.query.id as string | undefined
  const subdomain = router.query.subdomain as string
  const isPost = router.query.type === "post"

  const [draftKey, setDraftKey] = useState<string>("")
  useEffect(() => {
    if (subdomain) {
      if (!pageId) {
        const randomId = nanoid()
        const key = `draft-${subdomain}-local-${randomId}`
        setDraftKey(key)
        queryClient.invalidateQueries(["getPagesBySite", subdomain])
        router.replace(
          `/dashboard/${subdomain}/editor?id=local-${randomId}&type=${router.query.type}`,
        )
      } else {
        setDraftKey(`draft-${subdomain}-${pageId}`)
      }
    }
  }, [subdomain, pageId, queryClient])

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
  }, [page.isSuccess])

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
          pinyin(value as string, {
            style: pinyin.STYLE_NORMAL,
            compact: true,
          })?.[0]
            ?.map((word) => word.trim())
            ?.filter((word) => word)
            ?.join("-")
            ?.replace(/\s+/g, "-") || "",
        )
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

  useEffect(() => {
    if (createOrUpdatePage.isSuccess) {
      if (createOrUpdatePage.data?.code === 0) {
        if (values.published) {
          toast.success("Updated!")
        } else {
          toast.success(
            "Published!\nPlease wait a few seconds for the blockchain indexing to complete.",
          )
        }
        if (draftKey) {
          delStorage(draftKey)
          queryClient.invalidateQueries(["getPagesBySite", subdomain])
          queryClient.invalidateQueries(["getPage", draftKey])
        }
        router.push(`/dashboard/${subdomain}/${isPost ? "posts" : "pages"}`)
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
      pinyin(page.data.title || "", {
        style: pinyin.STYLE_NORMAL,
        compact: true,
      })?.[0]
        ?.map((word) => word.trim())
        ?.filter((word) => word)
        ?.join("-")
        ?.replace(/\s+/g, "-") || "",
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
      <DashboardLayout title="Editor">
        <DashboardMain fullWidth>
          {page.isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              Loading...
            </div>
          ) : (
            <>
              <header className="flex justify-between absolute top-0 left-0 right-0 z-10 px-5 h-14 border-b items-center text-sm">
                <div className="flex items-center">
                  <EditorToolbar
                    view={view}
                    toolbars={toolbars}
                  ></EditorToolbar>
                  <UniLink
                    className="ml-7 align-middle"
                    href={`${getSiteLink({
                      subdomain: "xlog",
                    })}/xfm`}
                  >
                    Tip: xLog Flavored Markdown
                  </UniLink>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={clsx(
                      `text-sm capitalize`,
                      visibility === PageVisibilityEnum.Draft
                        ? `text-zinc-300`
                        : visibility === PageVisibilityEnum.Modified
                        ? "text-orange-600"
                        : "text-green-600",
                    )}
                  >
                    {visibility?.toLowerCase()}
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
                    Preview
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
              </header>
              <div className="h-screen pt-14 flex w-full">
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
                        className="h-12 ml-1 inline-flex items-center border-none text-3xl font-bold w-full focus:outline-none"
                        placeholder="Title goes here.."
                      />
                    </div>
                    <div className="mt-5 flex-1 flex overflow-hidden">
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
                        className="px-5 w-1/2 overflow-scroll pb-[200px]"
                        parsedContent={parsedContent}
                        inputRef={previewRef}
                        onScroll={onPreviewScroll}
                        onMouseEnter={() => {
                          setCurrentScrollArea("preview")
                        }}
                      ></PageContent>
                    </div>
                  </div>
                </div>
                <div className="h-full overflow-auto flex-shrink-0 w-[280px] border-l bg-zinc-50 p-5 space-y-5">
                  <div>
                    <Input
                      type="datetime-local"
                      label="Publish at"
                      isBlock
                      name="publishAt"
                      id="publishAt"
                      value={getInputDatetimeValue(values.publishedAt)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const value = inLocalTimezone(
                          e.target.value,
                        ).toISOString()
                        updateValue("publishedAt", value)
                      }}
                      help={`This ${
                        isPost ? "post" : "page"
                      } will be accessible from this time`}
                    />
                  </div>
                  <div>
                    <Input
                      name="slug"
                      value={values.slug}
                      placeholder={defaultSlug}
                      label="Page slug"
                      id="slug"
                      isBlock
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateValue("slug", e.target.value)
                      }
                      help={
                        <>
                          {(values.slug || defaultSlug) && (
                            <>
                              This {isPost ? "post" : "page"} will be accessible
                              at{" "}
                              <UniLink
                                href={`${getSiteLink({
                                  subdomain,
                                  domain: site.data?.custom_domain,
                                })}/${values.slug || defaultSlug}`}
                                className="hover:underline"
                              >
                                {getSiteLink({
                                  subdomain,
                                  domain: site.data?.custom_domain,
                                  noProtocol: true,
                                })}
                                /{values.slug || defaultSlug}
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
                      label="Tags"
                      id="tags"
                      isBlock
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateValue("tags", e.target.value)
                      }
                      help='Separate multiple tags with English commas ","'
                    />
                  </div>
                  <div>
                    <Input
                      label="Excerpt"
                      isBlock
                      name="excerpt"
                      id="excerpt"
                      value={values.excerpt}
                      multiline
                      rows={5}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                        updateValue("excerpt", e.target.value)
                      }}
                      help="Leave it blank to use auto-generated excerpt"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </DashboardMain>
      </DashboardLayout>
    </>
  )
}
