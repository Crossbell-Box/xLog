import { json, type MetaFunction, type LoaderFunction } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"
import { formatDate } from "~/lib/date"
import { getTenant } from "~/lib/tenant.server"
import { PageVisibilityEnum, type PostOnArchivesPage } from "~/lib/types"

type LoaderData = {
  posts: PostOnArchivesPage[]
}

export const meta: MetaFunction = ({ data, parentsData }) => {
  return {
    title: `Archives - ${parentsData.root.site.name}`,
    description: parentsData.root.site.description,
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
  return json<LoaderData>({
    posts: pages,
  })
}

export default function ArchivesPage() {
  const { posts } = useLoaderData<LoaderData>()
  return (
    <>
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
    </>
  )
}
