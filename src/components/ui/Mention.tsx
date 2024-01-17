"use client"

import React, { memo } from "react"

import { getSiteLink } from "~/lib/helpers"
import { useGetSite } from "~/queries/site"

import { CharacterFloatCard } from "../common/CharacterFloatCard"
import { UniLink } from "./UniLink"

const getSiteId = ({ id, children }: { id: string; children?: any }) => {
  if (children && typeof children === "string" && children.startsWith("@")) {
    return children.replace(/^@/, "")
  } else if (id) {
    return id.replace(/^user-content-/, "")
  }
}

const Mention = memo(
  function Mention({ id, children }: { id: string; children?: any }) {
    let siteId = getSiteId({ id, children })

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
  },
  (prevProps, nextProps) => {
    return getSiteId(prevProps) === getSiteId(nextProps)
  },
)

export default Mention
