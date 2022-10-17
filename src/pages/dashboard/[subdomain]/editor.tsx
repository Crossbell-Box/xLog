import clsx from "clsx"
import dayjs from "dayjs"
import { useRouter } from "next/router"
import { ChangeEvent, useCallback, useEffect, useState, useRef } from "react"
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
import { useGetSite } from "~/queries/site"
import { getStorage, setStorage, delStorage } from "~/lib/storage"
import { nanoid } from "nanoid"
import { useQueryClient } from "@tanstack/react-query"
import { PageContent } from "~/components/common/PageContent"
import pinyin from "pinyin"
import { GITHUB_LINK } from "~/lib/env"
import type { Root } from "hast"
import CodeMirror from "@uiw/react-codemirror"
import { EditorView } from "@codemirror/view"
import { markdown } from "@codemirror/lang-markdown"

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
        const key = `draft-${subdomain}-local-${nanoid()}`
        setDraftKey(key)
        queryClient.invalidateQueries(["getPagesBySite", subdomain])
      } else {
        setDraftKey(`draft-${subdomain}-${pageId}`)
      }
    }
  }, [subdomain, pageId, queryClient])

  const site = useGetSite(subdomain)

  const page = useGetPage({
    site: subdomain!,
    pageId: pageId,
    render: false,
  })

  const visibility = page.data
    ? getPageVisibility(page.data)
    : PageVisibilityEnum.Draft
  const published = visibility !== PageVisibilityEnum.Draft

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

  const savePage = (published: boolean) => {
    createOrUpdatePage.mutate({
      ...values,
      slug: values.slug || defaultSlug,
      siteId: subdomain,
      ...(visibility === PageVisibilityEnum.Draft ? {} : { pageId: pageId }),
      isPost: isPost,
      published,
      externalUrl:
        (values.slug || defaultSlug) &&
        `${getSiteLink({ subdomain, domain: site.data?.custom_domain })}/${
          values.slug || defaultSlug
        }`,
      applications: page.data?.applications,
    })
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

  const handleDropFile = useCallback(
    async (file: File, view?: EditorView | null) => {
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
    [uploadFile],
  )

  useEffect(() => {
    if (!page.data || !draftKey) return

    const local = getStorage(draftKey)
    const useLocal =
      local?.date && +new Date(local?.date) > +new Date(page.data.date_updated)
    if (useLocal && local?.values) {
      setValues(local?.values)
    } else {
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
    }
  }, [page.data, subdomain, draftKey])

  const [view, setView] = useState<EditorView>()

  const extensions = [
    markdown(),
    EditorView.theme({
      ".cm-scroller": {
        fontFamily: "var(--font-sans)",
        fontSize: "1rem",
        overflow: "auto",
        height: "100%",
      },
      ".cm-content": {
        paddingBottom: "600px",
      },
      "&.cm-editor.cm-focused": {
        outline: "none",
      },
      "&.cm-editor": {
        height: "100%",
      },
    }),
    EditorView.domEventHandlers({
      drop(e) {
        const file = e.dataTransfer?.items[0]?.getAsFile()
        if (!file) return

        handleDropFile(file, view)
      },
      paste(e) {
        const file = e.clipboardData?.files[0]
        if (!file) return

        handleDropFile(file, view)
      },
    }),
  ]

  return (
    <>
      <DashboardLayout title="Editor">
        <DashboardMain fullWidth>
          <header className="flex justify-between absolute top-0 left-0 right-0 z-10 px-5 h-14 border-b items-center text-sm">
            <div className="flex items-center">
              <EditorToolbar view={view} toolbars={toolbars}></EditorToolbar>
              <UniLink
                className="ml-7 align-middle"
                href={`${GITHUB_LINK}/wiki/xLog-Flavored-Markdown`}
              >
                Tip: xLog Flavored Markdown
              </UniLink>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={clsx(
                  `text-sm`,
                  published ? `text-accent` : `text-zinc-300`,
                )}
              >
                {visibility === PageVisibilityEnum.Published
                  ? `Published${
                      getStorage(draftKey)
                        ? " and local modifications exist"
                        : ""
                    }`
                  : visibility === PageVisibilityEnum.Scheduled
                  ? "Scheduled"
                  : "Draft"}
              </span>
              <PublishButton
                save={savePage}
                published={published}
                isSaving={createOrUpdatePage.isLoading}
                isDisabled={published && !getStorage(draftKey) ? true : false}
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
                  />
                </div>
                <div className="mt-5 flex-1 flex overflow-hidden">
                  <CodeMirror
                    className="px-5 h-full border-r w-1/2"
                    value={values.content}
                    extensions={extensions}
                    onCreateEditor={(view) => setView(view)}
                    basicSetup={{
                      lineNumbers: false,
                      foldGutter: false,
                      highlightActiveLine: false,
                      history: true,
                      defaultKeymap: true,
                      historyKeymap: true,
                      dropCursor: true,
                      drawSelection: true,
                      indentOnInput: true,
                      crosshairCursor: true,
                      allowMultipleSelections: true,
                      syntaxHighlighting: true,
                    }}
                    indentWithTab={true}
                    onChange={(value) => updateValue("content", value)}
                    placeholder="Start writing..."
                  />
                  <PageContent
                    className="px-5 w-1/2 overflow-scroll pb-[200px]"
                    content={values.content}
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
                    const value = inLocalTimezone(e.target.value).toISOString()
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
                  value={values.slug || defaultSlug}
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
                          This {isPost ? "post" : "page"} will be accessible at{" "}
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
        </DashboardMain>
      </DashboardLayout>
    </>
  )
}
