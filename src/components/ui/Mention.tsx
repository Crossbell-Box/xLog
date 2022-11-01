import React from "react"
import { CharacterCard } from "../common/CharacterCard"
import { UniLink } from "./UniLink"
import { getSiteLink } from "~/lib/helpers"

export const Mention: React.FC<{
  id: string
}> = ({ id }) => {
  const siteId = id?.replace(/^user-content-/, "")
  console.log(siteId)
  return (
    <CharacterCard siteId={siteId}>
      <UniLink
        href={getSiteLink({
          subdomain: siteId,
        })}
        className="inline-block"
      >
        @{siteId}
      </UniLink>
    </CharacterCard>
  )
}
