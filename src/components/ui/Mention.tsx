import React from "react"
import { CharacterFloatCard } from "../common/CharacterFloatCard"
import { UniLink } from "./UniLink"
import { getSiteLink } from "~/lib/helpers"

export const Mention: React.FC<{
  id: string
}> = ({ id }) => {
  const siteId = id?.replace(/^user-content-/, "")
  return (
    <CharacterFloatCard siteId={siteId}>
      <UniLink
        href={getSiteLink({
          subdomain: siteId,
        })}
        className="inline-block"
      >
        @{siteId}
      </UniLink>
    </CharacterFloatCard>
  )
}
