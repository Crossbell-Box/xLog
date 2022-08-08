import { formatDate } from "~/lib/date"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { UniLink } from "~/components/ui/UniLink"
import { Note } from "~/lib/types"

export const PostMeta: React.FC<{
  page: Note
}> = ({ page }) => {
  return (
    <div className="text-zinc-400 mt-2">
      <span className="align-middle">{formatDate(page.date_published)}</span>
      <span className="align-middle mx-1"> · </span>
      <UniLink
        className="align-middle inline-block"
        href={
          page.related_urls?.filter((url) =>
            url.startsWith("https://scan.crossbell.io/tx/"),
          )?.[0]
        }
      >
        <BlockchainIcon className="fill-zinc-500" />
      </UniLink>
    </div>
  )
}
