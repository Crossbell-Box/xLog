import { json, type MetaFunction, type LoaderFunction } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { SiteLayout, type SiteLayoutProps } from "~/components/site/SiteLayout"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"
import { formatDate } from "~/lib/date"
import { getTenant } from "~/lib/tenant.server"
import { PageVisibilityEnum, type PostOnArchivesPage } from "~/lib/types"
import { getSubscription } from "~/models/site.model"

type LoaderData = {
  posts: PostOnArchivesPage[]
  site: SiteLayoutProps["site"]
  subscription: SiteLayoutProps["subscription"]
  isLoggedIn: boolean
}

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `Archives - ${data.site.name}`,
    description: data.site.description,
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const tenant = getTenant(request)
  if (!tenant)
    throw new Response("not found", {
      status: 404,
    })

  const user = await getAuthUser(request)
  const { pages } = await siteController.getPages(user, {
    site: tenant,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    take: 1000,
  })
  const { site } = await siteController.getSite(tenant)
  const subscription =
    user && (await getSubscription({ userId: user.id, siteId: site.id }))
  return json<LoaderData>({
    posts: pages,
    site: {
      id: site.id,
      name: site.name,
      description: site.description,
      icon: site.icon,
    },
    subscription: subscription?.config,
    isLoggedIn: !!user,
  })
}

export default function ArchivesPage() {
  const { posts, site, subscription, isLoggedIn } = useLoaderData<LoaderData>()
  return (
    <SiteLayout site={site} subscription={subscription} isLoggedIn={isLoggedIn}>
      <h2 className="text-xl font-bold page-title">Archives</h2>
      <div className="mt-5">
        {posts.map((post) => {
          return (
            <div key={post.id} className="flex">
              <span className="text-zinc-400 mr-3">
                {formatDate(post.publishedAt)}
              </span>
              <Link
                to={`/${post.slug}`}
                className="flex text-accent hover:underline"
              >
                {post.title}
              </Link>
            </div>
          )
        })}
      </div>
    </SiteLayout>
  )
}
