import { formatDate } from "~/lib/date"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { UniLink } from "~/components/ui/UniLink"
import { Note } from "~/lib/types"
import { CSB_SCAN } from "~/lib/env"

export const PostMeta: React.FC<{
  page: Note
}> = ({ page }) => {
  return (
    <div className="text-zinc-400 mt-2 xlog-post-meta">
      <span className="xlog-post-date align-middle">
        {formatDate(page.date_published)}
      </span>
      <span className="xlog-post-tags ml-4 space-x-1 align-middle">
        {page.tags
          ?.filter((tag) => tag !== "post" && tag !== "page")
          .map((tag) => (
            <UniLink
              className="hover:text-zinc-600"
              key={tag}
              href={`/tag/${tag}`}
            >
              <>#{tag}</>
            </UniLink>
          ))}
      </span>
      <span className="align-middle mx-1"> · </span>
      <UniLink
        className="xlog-post-blockchain align-middle inline-block"
        href={
          page.related_urls?.filter((url) =>
            url.startsWith(CSB_SCAN + "/tx/"),
          )?.[0]
        }
      >
        <BlockchainIcon className="fill-zinc-500" />
      </UniLink>
    </div>
  )
}
