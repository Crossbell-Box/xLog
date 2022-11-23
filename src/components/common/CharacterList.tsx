import clsx from "clsx"
import { Modal } from "~/components/ui/Modal"
import InfiniteScroll from "react-infinite-scroller"
import { Button } from "../ui/Button"
import { UniLink } from "../ui/UniLink"
import { CSB_SCAN } from "~/lib/env"
import { Avatar } from "../ui/Avatar"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { getSiteLink } from "~/lib/helpers"
import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"

export const CharacterList: React.FC<{
  open: boolean
  setOpen: (open: boolean) => void
  hasMore: boolean
  loadMore: () => Promise<void>
  list: any[]
  title: string
}> = ({ open, setOpen, hasMore, loadMore, list, title }) => {
  return (
    <Modal open={open} setOpen={setOpen} title={title}>
      <div className="px-5 overflow-auto flex-1">
        <InfiniteScroll
          loadMore={loadMore}
          hasMore={hasMore}
          loader={
            <div className="text-sm py-3 text-center" key={0}>
              Loading ...
            </div>
          }
          useWindow={false}
        >
          {list?.length ? (
            list.map((sub: any, index) => (
              <div
                className="py-3 flex items-center space-x-2 text-sm"
                key={index}
              >
                <UniLink
                  href={getSiteLink({
                    subdomain: sub?.character?.handle,
                  })}
                  className="flex items-center space-x-2 text-sm"
                >
                  <CharacterFloatCard siteId={sub?.character?.handle}>
                    <Avatar
                      className="align-middle border-2 border-white"
                      images={sub.character?.metadata?.content?.avatars || []}
                      name={
                        sub.character?.metadata?.content?.name ||
                        sub.character?.handle
                      }
                      size={40}
                    />
                  </CharacterFloatCard>
                  <span>{sub.character?.metadata?.content?.name}</span>
                  <span className="text-zinc-400 truncate max-w-xs">
                    @{sub.character?.handle}
                  </span>
                </UniLink>
                <UniLink
                  href={
                    CSB_SCAN +
                    "/tx/" +
                    (sub.metadata?.proof || sub.transactionHash)
                  }
                >
                  <BlockchainIcon />
                </UniLink>
              </div>
            ))
          ) : (
            <div className="py-3 text-center text-zinc-300">
              No Content Yet.
            </div>
          )}
        </InfiniteScroll>
      </div>
      <div className="h-16 border-t flex items-center px-5 py-4">
        <Button isBlock onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
    </Modal>
  )
}
