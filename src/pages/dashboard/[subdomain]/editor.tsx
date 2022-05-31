import { type EditorView } from "@codemirror/view"
import clsx from "clsx"
import dayjs from "dayjs"
import { useRouter } from "next/router"
import { ChangeEvent, useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { modeToolbars, toolbars } from "~/components/command"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { PublishButton } from "~/components/dashboard/PublishButton"
import { useEditor } from "~/components/ui/Editor"
import { EditorPreview } from "~/components/ui/EditorPreview"
import { EditorToolbar } from "~/components/ui/EditorToolbar"
import { Input } from "~/components/ui/Input"
import { UniLink } from "~/components/ui/UniLink"
import { useUploadFile } from "~/hooks/useUploadFile"
import { inLocalTimezone } from "~/lib/date"
import { getSiteLink } from "~/lib/helpers"
import { getPageVisibility } from "~/lib/page-helpers"
import { trpc } from "~/lib/trpc"
import { PageVisibilityEnum } from "~/lib/types"

const getInputDatetimeValue = (date: Date | string) => {
  const str = dayjs(date).format()
  return str.substring(0, ((str.indexOf("T") | 0) + 6) | 0)
}

export default function SubdomainEditor() {
  const router = useRouter()

  const subdomain = router.query.subdomain as string
  const isPost = router.query.type === "post"
  const pageId = router.query.id as string | undefined
  const trpcContext = trpc.useContext()
  const siteResult = trpc.useQuery(["site", { site: subdomain }], {
    enabled: !!subdomain,
  })
  const { data: page } = trpc.useQuery(
    ["site.page", { page: pageId!, site: subdomain, render: false }],
    {
      enabled: !!pageId,
      refetchOnWindowFocus: false,
    },
  )
  const published = page?.published ?? false
  const visibility = getPageVisibility({
    published,
    publishedAt: page?.publishedAt || null,
  })
  const {
    mutate: createOrUpdatePage,
    status: createOrUpdatePageStatus,
    data: createOrUpdatePageResult,
    error: createOrUpdatePageError,
    reset: resetCreateOrUpdatePage,
  } = trpc.useMutation("page.createOrUpdate")
  const uploadFile = useUploadFile()

  const [values, setValues] = useState({
    title: "",
    publishedAt: new Date().toISOString(),
    published: false,
    slug: "",
    excerpt: "",
  })
  const [content, setContent] = useState("")

  const [previewVisible, setPreviewVisible] = useState(false)

  type Values = typeof values

  const updateValue = useCallback(
    <K extends keyof Values>(key: K, value: Values[K]) => {
      setValues({
        ...values,
        [key]: value,
      })
    },
    [setValues, values],
  )

  const savePage = (published: boolean) => {
    createOrUpdatePage({
      ...values,
      siteId: siteResult.data!.id,
      pageId: page?.id,
      isPost: isPost,
      published,
      content,
    })
  }

  const handleDropFile = useCallback(
    async (file: File, view: EditorView) => {
      const toastId = toast.loading("Uploading...")
      try {
        if (!file.type.startsWith("image/")) {
          throw new Error("You can only upload images")
        }

        const { key } = await uploadFile(file, file.name)
        toast.success("Uploaded!", {
          id: toastId,
        })
        view.dispatch(
          view.state.replaceSelection(
            `\n\n![${file.name.replace(/\.\w+$/, "")}](${key})\n\n`,
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

  const handleEditorChange = (newValue: string) => {
    setContent(newValue)
  }

  const { editorRef, view } = useEditor({
    value: content,
    onChange: handleEditorChange,
    onDropFile: handleDropFile,
  })

  useEffect(() => {
    if (createOrUpdatePageStatus === "success") {
      resetCreateOrUpdatePage()
      toast.success(values.published ? "Updated" : "Saved!")
      trpcContext.invalidateQueries("site.page")
      router.replace(
        `/dashboard/${subdomain}/editor?id=${
          createOrUpdatePageResult.id
        }&type=${isPost ? "post" : "page"}`,
      )
    }
  }, [
    resetCreateOrUpdatePage,
    createOrUpdatePageStatus,
    createOrUpdatePageResult,
    isPost,
    router,
    subdomain,
    trpcContext,
    values.published,
  ])

  useEffect(() => {
    if (createOrUpdatePageStatus === "error") {
      resetCreateOrUpdatePage()
      toast.error(createOrUpdatePageError.message)
    }
  }, [
    resetCreateOrUpdatePage,
    createOrUpdatePageStatus,
    createOrUpdatePageError,
  ])

  useEffect(() => {
    if (!page) return

    setValues({
      title: page.title,
      publishedAt: page.publishedAt,
      published: page.published,
      slug: page.slug,
      excerpt: page.excerpt || "",
    })
    setContent(page.content)
  }, [page])

  return (
    <DashboardLayout title="Editor">
      <DashboardMain fullWidth>
        <header className="flex justify-between absolute top-0 left-0 right-0 z-10 px-5 h-14 border-b items-center text-sm">
          <EditorToolbar
            view={view}
            toolbars={toolbars}
            modeToolbars={modeToolbars}
            previewVisible={previewVisible}
            setPreviewVisible={setPreviewVisible}
          ></EditorToolbar>
          <div className="flex items-center space-x-3">
            <span
              className={clsx(
                `text-sm`,
                published ? `text-accent` : `text-zinc-300`,
              )}
            >
              {visibility === PageVisibilityEnum.Published
                ? "Published"
                : visibility === PageVisibilityEnum.Scheduled
                ? "Scheduled"
                : "Draft"}
            </span>
            <PublishButton
              save={savePage}
              published={published}
              isSaving={createOrUpdatePageStatus === "loading"}
            />
          </div>
        </header>
        <div className="h-screen pt-14 flex w-full">
          <div className="h-full overflow-auto w-full">
            <div className="mx-auto py-5 px-5">
              <div>
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
              <div className="mt-5">
                <div className="border border-gray-200 rounded">
                  <div className="flex">
                    <div className="flex-1" ref={editorRef}></div>
                    <EditorPreview
                      className="flex-1"
                      previewVisible={previewVisible}
                      content={content}
                    ></EditorPreview>
                  </div>
                </div>
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
                } will be accesisble from this time`}
              />
            </div>
            <div>
              <Input
                name="slug"
                value={values.slug}
                label="Page slug"
                id="slug"
                isBlock
                placeholder="some-slug"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateValue("slug", e.target.value)
                }
                help={
                  <>
                    {values.slug && (
                      <>
                        This {isPost ? "post" : "page"} will be accessible at{" "}
                        <UniLink
                          href={`${getSiteLink({ subdomain })}/${values.slug}`}
                          className="hover:underline"
                        >
                          {getSiteLink({ subdomain, noProtocol: true })}/
                          {values.slug}
                        </UniLink>
                      </>
                    )}
                  </>
                }
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
  )
}
