import React, { memo } from "react"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { CSB_SCAN } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { useGetSite } from "~/queries/site"

import { Avatar } from "../ui/Avatar"
import { UniLink } from "../ui/UniLink"
import { FollowingButton } from "./FollowingButton"

const CharacterListItem: React.FC<{
  character: any
  sub: any
}> = ({ character, sub }) => {
  const site = useGetSite(character?.handle)

  return (
    <div className="py-3 flex items-center justify-between space-x-2 text-sm">
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
              name={character?.metadata?.content?.name || character?.handle}
              size={40}
            />
          </CharacterFloatCard>
          <span>{character?.metadata?.content?.name}</span>
          <span className="text-zinc-400 truncate">@{character?.handle}</span>
        </UniLink>
        <UniLink
          href={
            CSB_SCAN + "/tx/" + (sub.metadata?.proof || sub.transactionHash)
          }
          className="flex items-center"
        >
          <BlockchainIcon />
        </UniLink>
      </div>
      <FollowingButton site={site.data} size="sm" />
    </div>
  )
}

export default memo(CharacterListItem)
