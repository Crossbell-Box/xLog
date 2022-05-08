import { Popover } from "@headlessui/react"
import { useFetcher, useLoaderData, useParams } from "@remix-run/react"
import clsx from "clsx"
import dayjs from "dayjs"
import { useCallback, useEffect, useState } from "react"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { Button } from "~/components/ui/Button"
import { getPageVisibility } from "~/lib/page-helpers"
import { PageVisibilityEnum } from "~/lib/types"
import { useRouteQuery } from "~/hooks/useRouteQuery"
import {
  type ActionFunction,
  json,
  type LoaderFunction,
  redirect,
} from "@remix-run/node"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"
import { getSite } from "~/models/site.model"
import { z } from "zod"
import toast from "react-hot-toast"
import { Input } from "~/components/ui/Input"
import { getSiteLink } from "~/lib/helpers"
import { useEditor } from "~/components/ui/Editor"
import { type EditorView } from "@codemirror/view"

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getAuthUser(request)
  if (!user) return redirect("/")

  const url = new URL(request.url)
  const pageId = url.searchParams.get("id") as string | undefined
  const subdomain = params.subdomain as string
  const page =
    pageId &&
    (await siteController.getPage(user, {
      page: pageId,
      site: subdomain,
    }))
  return json({
    page,
  })
}

export const action: ActionFunction = async ({ request, params }) => {
  const isDelete = request.method === "delete"
  const user = await getAuthUser(request)

  if (!user) return redirect("/")

  if (isDelete) {
    return null
  }

  const formData = await request.formData()
  const values = z
    .object({
      pageId: z.string().optional(),
      title: z.string(),
      content: z.string(),
      published: z.boolean(),
      publishedAt: z.string().transform((v) => new Date(v)),
      isPost: z.boolean(),
      slug: z.string(),
    })
    .parse(JSON.parse(formData.get("input") as string))

  const subdomain = params.subdomain as string
  const site = await getSite(subdomain)

  const { page } = await siteController.createOrUpdatePage(user, {
    pageId: values.pageId,
    siteId: site.id,
    title: values.title,
    content: values.content,
    isPost: values.isPost,
    published: values.published,
    publishedAt: values.publishedAt,
    slug: values.slug,
  })

  return redirect(
    `/dashboard/${subdomain}/editor?id=${page.id}&type=${
      values.isPost ? "post" : "page"
    }`
  )
}

const getInputDatetimeValue = (date: Date | string) => {
  const str = dayjs(date).format()
  return str.substring(0, ((str.indexOf("T") | 0) + 6) | 0)
}

export default function SubdomainEditor() {
  const query = useRouteQuery()
  const params = useParams()
  const subdomain = params.subdomain as string
  const isPost = query.type === "post"
  const { page } = useLoaderData()
  const published = page?.published ?? false
  const visibility = getPageVisibility({
    published,
    publishedAt: page?.publishedAt || null,
  })
  const [values, setValues] = useState({
    title: "",
    content: "",
    publishedAt: new Date(),
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

  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.type === "done") {
      console.log("updated")
      toast.success("Updated!")
    }
  }, [fetcher.type])

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
    (value) => updateValue("content", value),
    []
  )

  const handleDropFile = useCallback(async (file: File, view: EditorView) => {
    if (!file.type.startsWith("image/")) {
      toast.error("You can only upload images")
      return
    }

    const toastId = toast.loading("Uploading...")

    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/upload-image", {
      body: form,
      headers: {},
      credentials: "same-origin",
      method: "POST",
    })
    if (!res.ok) {
      toast.error("Upload failed", {
        id: toastId,
      })
    } else {
      const data = await res.json()
      if (data.error) {
        toast.error(data.error, { id: toastId })
      } else {
        toast.success("Uploaded!", {
          id: toastId,
        })
        view.dispatch(
          view.state.replaceSelection(
            `\n\n![${file.name.replace(/\.\w+$/, "")}](${data.file})\n\n`
          )
        )
      }
    }
  }, [])

  const { editorRef } = useEditor({
    value: values.content,
    onChange: handleEditorContentChange,
    onDropFile: handleDropFile,
    placeholder: "Start writing here..",
  })

  return (
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
                        isLoading={fetcher.state === "submitting"}
                        onClick={() => {
                          fetcher.submit(
                            {
                              input: JSON.stringify({
                                ...values,
                                pageId: page?.id,
                                isPost: isPost,
                              }),
                            },
                            {
                              method: "post",
                            }
                          )
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
        <div className="h-full overflow-auto flex-shrink-0 w-[280px] border-l bg-gray-50 p-5">
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
              {getSiteLink({ subdomain })}/{values.slug}
            </div>
          )}
        </div>
      </div>
    </DashboardMain>
  )
}
