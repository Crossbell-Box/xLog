import { useTranslation } from "next-i18next"
import React, { useEffect, useState } from "react"
import InfiniteScroll from "react-infinite-scroller"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { Modal } from "~/components/ui/Modal"
import { CSB_SCAN } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { Profile } from "~/lib/types"
import * as siteModel from "~/models/site.model"

import { Avatar } from "../ui/Avatar"
import { Button } from "../ui/Button"
import { UniLink } from "../ui/UniLink"
import { FollowingButton } from "./FollowingButton"

export const CharacterList: React.FC<{
  open: boolean
  setOpen: (open: boolean) => void
  hasMore: boolean
  loadMore: () => any
  list?: ({
    list: any[]
  } | null)[]
  title: string
}> = ({ open, setOpen, hasMore, loadMore, list, title }) => {
  const { t } = useTranslation("common")

  return (
    <Modal open={open} setOpen={setOpen} title={title} ZIndex={20}>
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
              page?.list?.map((sub: any, index) => {
                const character = sub?.character || sub?.fromCharacter
                return (
                  <div
                    className="py-3 flex items-center justify-between space-x-2 text-sm"
                    key={index}
                  >
                    <div className="flex flex-1 overflow-hidden space-x-2">
                      <UniLink
                        href={getSiteLink({
                          subdomain: character?.handle,
                        })}
                        className="flex items-center space-x-2 text-sm min-w-0"
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
                        <span className="text-zinc-400 truncate">
                          @{character?.handle}
                        </span>
                      </UniLink>
                      <UniLink
                        href={
                          CSB_SCAN +
                          "/tx/" +
                          (sub.metadata?.proof || sub.transactionHash)
                        }
                        className="flex items-center"
                      >
                        <BlockchainIcon />
                      </UniLink>
                    </div>
                    <FollowingButtonItem siteId={character.handle} />
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

const FollowingButtonItem: React.FC<{ siteId?: string }> = ({ siteId }) => {
  const [site, setSite] = useState<Profile>()

  useEffect(() => {
    if (siteId) {
      siteModel.getSite(siteId).then((site) => setSite(site))
    }
  }, [siteId])
  return <FollowingButton site={site} size="sm" />
}
