import { PageContent } from "../common/PageContent"
import { PostMeta } from "./PostMeta"
import { PostFooter } from "./PostFooter"
import { Note } from "~/lib/types"

export const SitePage: React.FC<{
  page?: Note | null
}> = ({ page }) => {
  return (
    <>
      <div className="">
        {page?.tags?.includes("post") ? (
          <h2 className="xlog-post-title text-4xl font-bold">{page.title}</h2>
        ) : (
          <h2 className="xlog-post-title text-xl font-bold page-title">
            {page?.title}
          </h2>
        )}
        {page?.tags?.includes("post") && <PostMeta page={page} />}
      </div>
      <PageContent
        className="mt-10"
        content={page?.body?.content}
      ></PageContent>
      <PostFooter page={page} />
    </>
  )
}
