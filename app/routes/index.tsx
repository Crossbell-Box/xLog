import { json, type MetaFunction, type LoaderFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { SiteHome } from "~/components/site/SiteHome"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"
import { APP_NAME } from "~/lib/config.shared"
import { getTenant } from "~/lib/tenant.server"
import { PageVisibilityEnum, type PostOnSiteHome } from "~/lib/types"

type LoaderData =
  | {
      type: "main"
      appName: string
      isLoggedIn: boolean
    }
  | {
      type: "tenant"
      isLoggedIn: boolean
      appName: string
      tenant?: string
      posts: PostOnSiteHome[]
    }

export const meta: MetaFunction = ({ parentsData }) => {
  return {
    title: `${parentsData.root.site.name}`,
    description: parentsData.root.site.description,
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
    return json<LoaderData>({
      type: "tenant",
      isLoggedIn,
      appName: APP_NAME,
      tenant,
      posts: pages,
    })
  }

  return json<LoaderData>({ type: "main", isLoggedIn, appName: APP_NAME })
}

export default function Home() {
  const data = useLoaderData<LoaderData>()

  if (data.type === "tenant") {
    return <SiteHome posts={data.posts} />
  }

  return null
}
