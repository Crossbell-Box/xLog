import type { PageType } from "~/lib/db.server"
import { formatDate } from "~/lib/date"
import { Rendered } from "~/markdown"
import { Avatar } from "../ui/Avatar"
import { getUserContentsUrl } from "~/lib/user-contents"
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
      <div
        className="my-8 prose"
        dangerouslySetInnerHTML={{ __html: page.rendered?.contentHTML || "" }}
      ></div>
    </>
  )
}
