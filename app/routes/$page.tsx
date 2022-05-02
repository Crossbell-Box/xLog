import { json, type MetaFunction, type LoaderFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { SitePage } from "~/components/site/SitePage"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"
import { renderPageContent } from "~/lib/markdown.server"
import { getTenant } from "~/lib/tenant.server"

export const meta: MetaFunction = ({ data, parentsData }) => {
  return {
    title: `${data.page.title} - ${parentsData.root.site.name}`,
    description: parentsData.root.site.description,
  }
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getAuthUser(request)
  const tenant = getTenant(request)

  if (!tenant) {
    throw new Response("not found", {
      status: 404,
    })
  }

  const pageSlug = params.page as string
  const page = await siteController.getPage(user, {
    page: pageSlug,
    site: tenant,
  })
  const { html } = await renderPageContent(page.content)
  return json({
    type: "tenant",
    page: {
      id: page.id,
      title: page.title,
      type: page.type,
      content: html,
      publishedAt: page.publishedAt,
    },
  })
}

export default function Page() {
  const data = useLoaderData()

  if (data.type === "tenant") {
    return <SitePage page={data.page}></SitePage>
  }

  return null
}
