"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { FollowAllButton } from "~/components/common/FollowAllButton"
import { Image } from "~/components/ui/Image"
import { UniLink } from "~/components/ui/UniLink"
import { DEFAULT_AVATAR } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { cn } from "~/lib/utils"
import { useGetShowcase } from "~/queries/home"

import { Loading } from "../common/Loading"

export function ShowCase() {
  const showcaseSites = useGetShowcase()
  const [showcaseMore, setShowcaseMore] = useState(false)
  const t = useTranslations()

  return (
    <>
      <FollowAllButton
        className="mt-5"
        size="xl"
        characterIds={showcaseSites.data
          ?.map((s: { characterId?: string }) => s.characterId)
          .filter(Boolean)
          .map(Number)}
        siteIds={showcaseSites.data?.map((s: { handle: string }) => s.handle)}
      />
      {showcaseSites.isLoading && <Loading className="mt-10" />}
      <ul
        className={`pt-10 grid grid-cols-2 md:grid-cols-3 gap-10 overflow-y-hidden relative text-left ${
          showcaseMore ? "" : "max-h-[540px]"
        }`}
      >
        <div
          className={cn(
            "absolute bottom-0 h-20 inset-x-0 bg-gradient-to-t from-white via-white flex items-end justify-center font-bold cursor-pointer",
            showcaseMore && "hidden",
          )}
          onClick={() => setShowcaseMore(true)}
        >
          {t("Show more")}
        </div>
        {showcaseSites.data?.map((site) => (
          <li className="inline-flex align-middle" key={site.handle}>
            <UniLink
              href={getSiteLink({
                subdomain: site.handle,
              })}
              className="inline-flex align-middle w-full"
            >
              <CharacterFloatCard siteId={site.handle}>
                <span className="size-14 inline-block">
                  <Image
                    className="rounded-full"
                    src={site.metadata?.content?.avatars?.[0] || DEFAULT_AVATAR}
                    alt={site.handle}
                    width="56"
                    height="56"
                  ></Image>
                </span>
              </CharacterFloatCard>
              <span className="ml-3 min-w-0 flex-1 justify-center inline-flex flex-col">
                <span className="truncate w-full inline-block font-medium">
                  {site.metadata?.content?.name}
                </span>
                {site.metadata?.content?.bio && (
                  <span className="text-gray-500 text-xs truncate w-full inline-block mt-1">
                    {site.metadata.content?.bio}
                  </span>
                )}
              </span>
            </UniLink>
          </li>
        ))}
      </ul>
    </>
  )
}
