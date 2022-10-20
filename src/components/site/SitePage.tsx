import { PageContent } from "../common/PageContent"
import { PostMeta } from "./PostMeta"
import { PostFooter } from "./PostFooter"
import { Note } from "~/lib/types"

export const SitePage: React.FC<{
  page?: Note | null
}> = ({ page }) => {
  return (
    <>
      {page?.preview && (
        <div className="fixed top-0 left-0 w-full text-center text-orange-500 bg-gray-100 py-2 opacity-80 text-sm">
          Currently in private preview mode, the content is different from the
          public
        </div>
      )}
      <div>
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
        toc={true}
      ></PageContent>
      {page?.metadata && <PostFooter page={page} />}
    </>
  )
}
