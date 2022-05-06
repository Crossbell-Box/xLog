import { json, type MetaFunction, type LoaderFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { MainLayout } from "~/components/main/MainLayout"
import { SiteHome } from "~/components/site/SiteHome"
import { SiteLayout, type SiteLayoutProps } from "~/components/site/SiteLayout"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"
import { APP_DESCRIPTION } from "~/lib/constants"
import { APP_NAME } from "~/lib/env"
import { getTenant } from "~/lib/tenant.server"
import { PageVisibilityEnum, type PostOnSiteHome } from "~/lib/types"
import { getSubscription } from "~/models/site.model"

type LoaderData =
  | {
      type: "main"
      isLoggedIn: boolean
    }
  | {
      type: "tenant"
      isLoggedIn: boolean
      tenant?: string
      posts: PostOnSiteHome[]
      site: SiteLayoutProps["site"]
      subscription: SiteLayoutProps["subscription"]
    }

export const meta: MetaFunction = ({
  data,
}: {
  parentsData: any
  data: LoaderData
}) => {
  if (data.type === "main") {
    return {
      title: APP_NAME,
      description: APP_DESCRIPTION,
    }
  }
  return {
    title: `${data.site.name}`,
    description: data.site.description,
  }
}

export const loader: LoaderFunction = async (ctx) => {
  const user = await getAuthUser(ctx.request)
  const tenant = getTenant(ctx.request)

  const isLoggedIn = !!user

  if (tenant) {
    const { pages } = await siteController.getPages(user, {
      visibility: PageVisibilityEnum.Published,
      type: "post",
      site: tenant,
    })
    const { site } = await siteController.getSite(tenant)
    const subscription =
      user && (await getSubscription({ userId: user.id, siteId: site.id }))
    return json<LoaderData>({
      type: "tenant",
      isLoggedIn,
      tenant,
      posts: pages,
      site: {
        id: site.id,
        name: site.name,
        description: site.description,
        icon: site.icon,
      },
      subscription: subscription?.config,
    })
  }

  return json<LoaderData>({
    type: "main",
    isLoggedIn,
  })
}

export default function Home() {
  const data = useLoaderData<LoaderData>()

  if (data.type === "tenant") {
    return (
      <SiteLayout
        site={data.site}
        isLoggedIn={data.isLoggedIn}
        subscription={data.subscription}
      >
        <SiteHome posts={data.posts} />
      </SiteLayout>
    )
  }

  return <MainLayout isLoggedIn={data.isLoggedIn}>{""}</MainLayout>
}
