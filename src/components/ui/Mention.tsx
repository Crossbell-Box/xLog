import React from "react"
import { CharacterFloatCard } from "../common/CharacterFloatCard"
import { UniLink } from "./UniLink"
import { getSiteLink } from "~/lib/helpers"
import { useGetSite } from "~/queries/site"

export const Mention: React.FC<{
  id: string
  children?: any
}> = ({ id, children }) => {
  let siteId
  if (
    children?.[0] &&
    typeof children[0] === "string" &&
    children[0].startsWith("@")
  ) {
    siteId = children[0].replace(/^@/, "")
  } else if (id) {
    siteId = id.replace(/^user-content-/, "")
  }

  const site = useGetSite(siteId)

  if (siteId && site.data) {
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
  } else {
    return <>{children}</>
  }
}
