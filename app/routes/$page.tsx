import { json, type MetaFunction, type LoaderFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { SiteLayout } from "~/components/site/SiteLayout"
import { SitePage } from "~/components/site/SitePage"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"
import { renderPageContent } from "~/lib/markdown.server"
import { getTenant } from "~/lib/tenant.server"
import { getSubscription } from "~/models/site.model"

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `${data.page.title} - ${data.site.name}`,
    description: data.site.description,
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
  const isLoggedIn = !!user
  const pageSlug = params.page as string
  const page = await siteController.getPage(user, {
    page: pageSlug,
    site: tenant,
  })
  const { site } = await siteController.getSite(tenant)
  const subscription =
    user && (await getSubscription({ userId: user.id, siteId: site.id }))
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
    site: {
      id: site.id,
      name: site.name,
      description: site.description,
      icon: site.icon,
    },
    subscription: subscription?.config,
    isLoggedIn,
  })
}

export default function Page() {
  const data = useLoaderData()

  if (data.type === "tenant") {
    return (
      <SiteLayout
        site={data.site}
        subscription={data.subscription}
        isLoggedIn={data.isLoggedIn}
      >
        <SitePage page={data.page}></SitePage>
      </SiteLayout>
    )
  }

  return null
}
