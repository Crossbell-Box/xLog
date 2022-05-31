import type { PageType } from "~/lib/db.server"
import { Rendered } from "~/markdown"
import { PageContent } from "../common/PageContent"
import { PostMeta } from "./PostMeta"

export const SitePage: React.FC<{
  page: {
    type: PageType
    publishedAt: string
    title: string
    rendered: Rendered | null
    authors?: { id: string; name: string; avatar: string | null }[]
  }
}> = ({ page }) => {
  return (
    <>
      <div className="">
        {page.type === "POST" ? (
          <h2 className="text-4xl font-bold">{page.title}</h2>
        ) : (
          <h2 className="text-xl font-bold page-title">{page.title}</h2>
        )}
        {page.type === "POST" && (
          <PostMeta
            publishedAt={page.publishedAt}
            authors={page.authors || []}
          />
        )}
      </div>
      <PageContent
        contentHTML={page.rendered?.contentHTML || ""}
        className="my-8"
      />
    </>
  )
}
