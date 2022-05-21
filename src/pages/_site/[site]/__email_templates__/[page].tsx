import { createSSGHelpers } from "@trpc/react/ssg"
import { InferGetServerSidePropsType } from "next"
import { PostAuthors } from "~/components/site/PostMeta"
import { UniLink } from "~/components/ui/UniLink"
import { SITE_URL } from "~/lib/env"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { getTRPCContext } from "~/lib/trpc.server"
import { appRouter } from "~/router"

export const config = {
  unstable_runtimeJS: false,
  unstable_JsPreload: false,
}

export const getServerSideProps = serverSidePropsHandler(async (ctx) => {
  console.log("??")
  const domainOrSubdomain = ctx.params!.site as string
  const pageSlug = ctx.params!.page as string
  const trpcContext = await getTRPCContext(ctx)
  const ssg = createSSGHelpers({ router: appRouter, ctx: trpcContext })
  const page = await ssg.fetchQuery("site.page", {
    site: domainOrSubdomain,
    page: pageSlug,
    render: true,
    includeAuthors: true,
  })

  return {
    props: {
      page,
    },
  }
})

export default function PageEmailPreview({
  page,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className=" max-w-screen-2xl mx-auto">
      <div className="bg-zinc-100 py-2 px-4 mb-4 rounded-lg text-indigo-700">
        <UniLink
          href={`/${page.slug}`}
          className="font-medium flex items-center space-x-2"
        >
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
              clipRule="evenodd"
            />
          </svg>
          <span>You can also view this post in browser</span>
        </UniLink>
      </div>
      <h2 className="text-4xl font-bold mb-5">{page.title}</h2>
      <PostAuthors authors={page.authors || []} />
      <div
        className="prose prose-email mt-10"
        dangerouslySetInnerHTML={{ __html: page.rendered!.contentHTML }}
      ></div>
      <footer className="mt-20 py-16 text-center text-zinc-500">
        <div className="text-zinc-400 text-sm">
          Not interested?{" "}
          <a
            href={`${SITE_URL}/api/unsubscribe?token=%recipient.unsubscribeToken%`}
            className="text-indigo-500"
          >
            Unsubscribe
          </a>
        </div>
        <div className="mt-4 font-medium">
          Published on{" "}
          <UniLink href={SITE_URL} className="hover:text-indigo-500">
            Proselog
          </UniLink>
        </div>
      </footer>
    </div>
  )
}
