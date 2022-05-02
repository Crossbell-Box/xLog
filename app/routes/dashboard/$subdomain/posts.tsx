import { LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData, useParams } from "@remix-run/react"
import { PagesManager } from "~/components/dashboard/PagesManager"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"

export const createLoader =
  (isPost: boolean): LoaderFunction =>
  async ({ request, params }) => {
    const url = new URL(request.url)
    const subdomain = params.subdomain as string
    const user = await getAuthUser(request)
    if (!user) return redirect("/")
    const { pages } = await siteController.getPages(user, {
      site: subdomain,
      type: isPost ? "post" : "page",
      take: parseInt(url.searchParams.get("take") || "30", 10),
      cursor: url.searchParams.get("cursor"),
      visibility: url.searchParams.get("visibility") as any,
    })
    return { pages, isPost }
  }

export const loader: LoaderFunction = /* @__PURE__ */ createLoader(true)

export default function SubdomainPosts() {
  const params = useParams()
  const subdomain = params.subdomain as string
  const { pages, isPost } = useLoaderData()
  return <PagesManager isPost={isPost} pages={pages} subdomain={subdomain} />
}
