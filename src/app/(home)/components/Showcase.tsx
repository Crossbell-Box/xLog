"use client"

import { useState } from "react"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { FollowAllButton } from "~/components/common/FollowAllButton"
import { Image } from "~/components/ui/Image"
import { UniLink } from "~/components/ui/UniLink"
import { getSiteLink } from "~/lib/helpers"
import { useGetShowcase } from "~/queries/home"

export function ShowCase() {
  const showcaseSites = useGetShowcase()
  const [showcaseMore, setShowcaseMore] = useState(false)

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
      <ul
        className={`pt-10 grid grid-cols-2 md:grid-cols-3 gap-10 overflow-y-hidden relative text-left ${
          showcaseMore ? "" : "max-h-[540px]"
        }`}
      >
        <div
          className={`absolute bottom-0 h-20 left-0 right-0 bg-gradient-to-t from-white via-white flex items-end justify-center font-bold cursor-pointer ${
            showcaseMore ? "hidden" : ""
          }`}
          onClick={() => setShowcaseMore(true)}
        >
          {/* {t("Show more")} */}
          Show more
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
                <span className="w-14 h-14 inline-block">
                  <Image
                    className="rounded-full"
                    src={
                      site.metadata?.content?.avatars?.[0] ||
                      "ipfs://bafkreiabgixxp63pg64moxnsydz7hewmpdkxxi3kdsa4oqv4pb6qvwnmxa"
                    }
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
