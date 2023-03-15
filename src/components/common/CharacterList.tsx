import { Modal } from "~/components/ui/Modal"
import InfiniteScroll from "react-infinite-scroller"
import { Button } from "../ui/Button"
import { UniLink } from "../ui/UniLink"
import { CSB_SCAN } from "~/lib/env"
import { Avatar } from "../ui/Avatar"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { getSiteLink } from "~/lib/helpers"
import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { useTranslation } from "next-i18next"

export const CharacterList: React.FC<{
  open: boolean
  setOpen: (open: boolean) => void
  hasMore: boolean
  loadMore: () => Promise<void>
  list: {
    list: any[]
  }[]
  title: string
}> = ({ open, setOpen, hasMore, loadMore, list, title }) => {
  const { t } = useTranslation("common")

  return (
    <Modal open={open} setOpen={setOpen} title={title}>
      <div className="px-5 overflow-auto flex-1">
        <InfiniteScroll
          loadMore={loadMore}
          hasMore={hasMore}
          loader={
            <div className="text-sm py-3 text-center" key={0}>
              {t("Loading")} ...
            </div>
          }
          useWindow={false}
        >
          {list?.length ? (
            list.map((page) =>
              page.list?.map((sub: any, index) => {
                const character = sub?.character || sub?.fromCharacter
                return (
                  <div
                    className="py-3 flex items-center space-x-2 text-sm"
                    key={index}
                  >
                    <UniLink
                      href={getSiteLink({
                        subdomain: character?.handle,
                      })}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <CharacterFloatCard siteId={character?.handle}>
                        <Avatar
                          className="align-middle border-2 border-white"
                          images={character?.metadata?.content?.avatars || []}
                          name={
                            character?.metadata?.content?.name ||
                            character?.handle
                          }
                          size={40}
                        />
                      </CharacterFloatCard>
                      <span>{character?.metadata?.content?.name}</span>
                      <span className="text-zinc-400 truncate max-w-xs">
                        @{character?.handle}
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
                )
              }),
            )
          ) : (
            <div className="py-3 text-center text-zinc-300">
              {t("No Content Yet.")}
            </div>
          )}
        </InfiniteScroll>
      </div>
      <div className="h-16 border-t flex items-center px-5 py-4">
        <Button isBlock onClick={() => setOpen(false)}>
          {t("Close")}
        </Button>
      </div>
    </Modal>
  )
}
