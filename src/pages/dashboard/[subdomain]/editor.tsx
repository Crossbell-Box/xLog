import { Popover } from "@headlessui/react"
import clsx from "clsx"
import dayjs from "dayjs"
import { useCallback, useEffect, useState } from "react"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { Button } from "~/components/ui/Button"
import { getPageVisibility } from "~/lib/page-helpers"
import { PageVisibilityEnum } from "~/lib/types"
import toast from "react-hot-toast"
import { Input } from "~/components/ui/Input"
import { getSiteLink } from "~/lib/helpers"
import { useEditor } from "~/components/ui/Editor"
import { type EditorView } from "@codemirror/view"
import { trpc } from "~/lib/trpc"
import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { UniLink } from "~/components/ui/UniLink"
import { useUploadFile } from "~/hooks/useUploadFile"

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
  const pageResult = trpc.useQuery(
    ["site.page", { page: pageId!, site: subdomain }],
    {
      enabled: !!pageId,
    }
  )
  const page = pageResult.data
  const published = page?.published ?? false
  const visibility = getPageVisibility({
    published,
    publishedAt: page?.publishedAt || null,
  })
  const createOrUpdatePage = trpc.useMutation("site.createOrUpdatePage")
  const uploadFile = useUploadFile()

  const [values, setValues] = useState({
    title: "",
    content: "",
    publishedAt: new Date().toISOString(),
    published: false,
    slug: "",
  })
  const updateValue = (field: string, value: any) => {
    setValues((values) => {
      return {
        ...values,
        [field]: value,
      }
    })
  }

  useEffect(() => {
    if (createOrUpdatePage.isSuccess) {
      createOrUpdatePage.reset()
      toast.success("Updated!")
      trpcContext.invalidateQueries("site.page")
      router.replace(
        `/dashboard/${subdomain}/editor?id=${createOrUpdatePage.data.id}&type=${
          isPost ? "post" : "page"
        }`
      )
    }
  }, [createOrUpdatePage, isPost, router, subdomain, trpcContext])

  useEffect(() => {
    if (createOrUpdatePage.isError) {
      createOrUpdatePage.reset()
      toast.error(createOrUpdatePage.error.message)
    }
  }, [createOrUpdatePage])

  useEffect(() => {
    if (!page) return

    setValues((values) => {
      return {
        ...values,
        title: page.title,
        content: page.content,
        publishedAt: page.publishedAt,
        published: page.published,
        slug: page.slug,
      }
    })
  }, [page])

  const handleEditorContentChange = useCallback(
    (value: string) => updateValue("content", value),
    []
  )

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
            `\n\n![${file.name.replace(/\.\w+$/, "")}](${key})\n\n`
          )
        )
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message, { id: toastId })
        }
      }
    },
    [uploadFile]
  )

  const { editorRef, view } = useEditor({
    value: values.content,
    onChange: handleEditorContentChange,
    onDropFile: handleDropFile,
    placeholder: "Start writing here..",
  })

  const focusEditor = () => {
    view?.focus()
  }

  return (
    <DashboardLayout>
      <DashboardMain fullWidth>
        <header className="flex justify-between absolute top-0 left-0 right-0 z-10 px-5 h-14 border-b items-center text-sm">
          <div></div>
          <div className="flex items-center space-x-3">
            <span
              className={clsx(
                `text-sm`,
                published ? `text-accent` : `text-zinc-300`
              )}
            >
              {visibility === PageVisibilityEnum.Published
                ? "Published"
                : visibility === PageVisibilityEnum.Scheduled
                ? "Scheduled"
                : "Draft"}
            </span>
            <Popover className="relative">
              <Popover.Button className="button is-primary rounded-lg select-none">
                Publish
              </Popover.Button>

              <Popover.Panel className="absolute right-0 z-10 pt-2">
                {({ close }) => {
                  return (
                    <div className="border p-5 rounded-lg min-w-[240px] bg-white shadow-modal">
                      <div className="space-y-3">
                        <label className="block">
                          <span className="block text-zinc-400 font-medium text-sm">
                            Publish at
                          </span>
                          <input
                            type="datetime-local"
                            value={getInputDatetimeValue(values.publishedAt)}
                            onChange={(e) => {
                              updateValue("publishedAt", e.target.value)
                            }}
                          />
                        </label>
                        <label className="block">
                          <span className="block text-zinc-400 font-medium text-sm">
                            Status
                          </span>
                          <input
                            type="checkbox"
                            checked={values.published}
                            onChange={(e) =>
                              updateValue("published", e.target.checked)
                            }
                          />{" "}
                          {values.published ? "Published" : "Draft"}
                        </label>
                      </div>
                      <div className="mt-5">
                        <Button
                          isLoading={createOrUpdatePage.isLoading}
                          onClick={() => {
                            createOrUpdatePage.mutate({
                              ...values,
                              siteId: siteResult.data!.id,
                              pageId: page?.id,
                              isPost: isPost,
                            })
                          }}
                        >
                          {published ? "Update" : "Publish"}
                        </Button>
                      </div>
                    </div>
                  )
                }}
              </Popover.Panel>
            </Popover>
          </div>
        </header>
        <div className="h-screen pt-14 flex w-full">
          <div className="h-full overflow-auto w-full">
            <div className="max-w-screen-md mx-auto py-5 px-5">
              <div>
                <input
                  type="text"
                  name="title"
                  value={values.title}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      focusEditor()
                    }
                  }}
                  onChange={(e) => updateValue("title", e.target.value)}
                  className="h-12 ml-1 inline-flex items-center border-none text-3xl font-bold w-full focus:outline-none"
                  placeholder="Title goes here.."
                />
              </div>
              <div className="mt-5">
                <div className="">
                  <div ref={editorRef}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="h-full overflow-auto flex-shrink-0 w-[280px] border-l bg-zinc-50 p-5">
            <div>
              <Input
                name="slug"
                value={values.slug}
                label="Page slug"
                id="slug"
                isBlock
                onChange={(e) => updateValue("slug", e.target.value)}
              />
              {values.slug && (
                <div className="text-xs text-gray-400 mt-1">
                  This {isPost ? "post" : "page"} will be accessible at{" "}
                  <UniLink
                    href={`${getSiteLink({ subdomain })}/${values.slug}`}
                    className="hover:underline"
                  >
                    {getSiteLink({ subdomain, noProtocol: true })}/{values.slug}
                  </UniLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardMain>
    </DashboardLayout>
  )
}
