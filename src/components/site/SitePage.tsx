import type { PageType } from "~/lib/db.server"
import { Rendered } from "~/markdown"
import { PageContent } from "../common/PageContent"
import { PostMeta } from "./PostMeta"
import { PostFooter } from "./PostFooter"
import { Profile, Note } from "~/lib/types"

export const SitePage: React.FC<{
  site?: Profile
  page?: Note
}> = ({ site, page }) => {
  return (
    <>
      <div className="">
        {page?.tags?.includes("post") ? (
          <h2 className="text-4xl font-bold">{page.title}</h2>
        ) : (
          <h2 className="text-xl font-bold page-title">{page?.title}</h2>
        )}
        {page?.tags?.includes("post") && (
          <PostMeta publishedAt={page.date_published} />
        )}
      </div>
      <PageContent contentHTML={page?.body?.content || ""} className="mt-10" />
      <PostFooter page={page} />
    </>
  )
}
