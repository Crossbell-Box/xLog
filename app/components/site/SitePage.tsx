import type { PageType } from "@prisma/client"
import { formatDate } from "~/lib/date"

export const SitePage: React.FC<{
  page: {
    type: PageType
    publishedAt: string
    title: string
    content: string
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
          <div className="text-zinc-400 italic mt-2">
            {formatDate(page.publishedAt)}
          </div>
        )}
      </div>
      <div
        className="my-8 prose"
        dangerouslySetInnerHTML={{ __html: page.content }}
      ></div>
    </>
  )
}
