import { getTranslations } from "next-intl/server"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { SearchInput } from "~/components/common/SearchInput"
import { Avatar } from "~/components/ui/Avatar"
import { UniLink } from "~/components/ui/UniLink"
import { getSiteLink } from "~/lib/helpers"
import getQueryClient from "~/lib/query-client"
import { getShowcase } from "~/queries/home.server"
import { getBlockNumber } from "~/queries/site.server"

import { FollowAllButton } from "../common/FollowAllButton"
import { BlockNumber } from "./BlockNumber"
import PromotionLinks from "./PromotionLinks"
import ShowMoreContainer from "./ShowMoreContainer"

export async function HomeSidebar({ hideSearch }: { hideSearch?: boolean }) {
  const showcaseSites = await getShowcase()
  const t = await getTranslations()
  const queryClient = getQueryClient()
  await getBlockNumber(queryClient)

  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <PromotionLinks />
      <UniLink
        href="/about"
        className="text-zinc-800 text-center block space-y-4"
      >
        {t.rich("description", {
          opensourceLink: (chunks) => (
            <span className="underline decoration-2 text-green-400 font-medium">
              {chunks}
            </span>
          ),
          blockchainLink: (chunks) => (
            <span className="underline decoration-2 text-yellow-400 font-medium">
              {chunks}
            </span>
          ),
        })}
        <BlockNumber />
      </UniLink>
      {!hideSearch && <SearchInput />}
      <div className="text-center text-zinc-700 space-y-3">
        <p className="font-bold text-lg">{t("Suggested creators for you")}</p>
        <FollowAllButton
          characterIds={showcaseSites
            ?.map((s: { characterId?: string }) => s.characterId)
            .filter(Boolean)
            .map(Number)}
          siteIds={showcaseSites?.map((s: { handle: string }) => s.handle)}
        />
        <ShowMoreContainer>
          <>
            {showcaseSites?.map((site) => (
              <li className="flex align-middle" key={site.handle}>
                <UniLink
                  href={getSiteLink({
                    subdomain: site.handle,
                  })}
                  className="inline-flex align-middle w-full"
                >
                  <CharacterFloatCard siteId={site.handle}>
                    <span className="size-10 inline-block">
                      <Avatar
                        cid={site?.characterId}
                        images={site?.metadata?.content?.avatars || []}
                        size={40}
                        name={site?.metadata?.content?.name}
                      ></Avatar>
                    </span>
                  </CharacterFloatCard>
                  <span className="ml-3 min-w-0 flex-1 justify-center inline-flex flex-col">
                    <span className="truncate w-full inline-block font-medium">
                      {site?.metadata?.content?.name}
                    </span>
                    {site?.metadata?.content?.bio && (
                      <span className="text-gray-500 text-xs truncate w-full inline-block mt-1">
                        {site.metadata.content?.bio}
                      </span>
                    )}
                  </span>
                </UniLink>
              </li>
            ))}
          </>
        </ShowMoreContainer>
      </div>
    </Hydrate>
  )
}
