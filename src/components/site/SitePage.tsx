import type { PageType } from "~/lib/db.server"
import { formatDate } from "~/lib/date"
import { Rendered } from "~/markdown"
import { Avatar } from "../ui/Avatar"
import { getUserContentsUrl } from "~/lib/user-contents"

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
          <div className="text-zinc-400 mt-2 flex items-center">
            <span>{formatDate(page.publishedAt)}</span>
            <div className="flex items-center ml-5">
              {page.authors?.map((author) => {
                return (
                  <span key={author.id} className="flex items-center space-x-2">
                    <Avatar
                      size={24}
                      images={[getUserContentsUrl(author.avatar)]}
                      name={author.name}
                    />
                    <span>{author.name}</span>
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <div
        className="my-8 prose"
        dangerouslySetInnerHTML={{ __html: page.rendered?.contentHTML || "" }}
      ></div>
    </>
  )
}
