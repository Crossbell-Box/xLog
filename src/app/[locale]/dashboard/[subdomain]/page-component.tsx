"use client"

import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import Heatmap from "~/components/common/Heatmap"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { Image } from "~/components/ui/Image"
import { UniLink } from "~/components/ui/UniLink"
import { useDate } from "~/hooks/useDate"
import {
  CSB_SCAN,
  DEFAULT_AVATAR,
  DISCORD_LINK,
  GITHUB_LINK,
  TWITTER_LINK,
} from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { cn } from "~/lib/utils"
import { useGetShowcase } from "~/queries/home"
import { useGetPagesBySite } from "~/queries/page"
import { useGetSite, useGetStat, useGetTips } from "~/queries/site"

export default function SubdomainIndex() {
  const params = useParams()
  const subdomain = params?.subdomain as string
  const site = useGetSite(subdomain)
  const characterId = site.data?.characterId
  const stat = useGetStat({
    characterId,
  })
  const date = useDate()
  const t = useTranslations()
  const tips = useGetTips({
    toCharacterId: characterId,
    limit: 1000,
  })

  const statMap = [
    {
      icon: "i-mingcute-news-line",
      name: "Creation",
      value: stat.data?.notesCount ?? "-",
      url: `/dashboard/${subdomain}/posts`,
    },
    {
      icon: "i-mingcute-comment-line",
      name: "Comments",
      value: stat.data?.commentsCount ?? "-",
      url: `/dashboard/${subdomain}/comments`,
    },
    {
      icon: "i-mingcute-heart-line",
      name: "Tips1",
      value: `${
        tips.data?.pages?.[0]?.list
          ?.map((i) => +i.amount)
          .reduce((acr, cur) => acr + cur, 0) ?? "-"
      } MIRA`,
      url: `/dashboard/${subdomain}/tokens`,
    },
    {
      icon: "i-mingcute-thumb-up-2-line",
      name: "Likes",
      value: stat.data?.likesCount ?? "-",
      url: getSiteLink({
        subdomain,
      }),
    },
    {
      icon: "i-mingcute-user-follow-line",
      name: "Followers",
      value: stat.data?.subscriptionCount ?? "-",
      url: getSiteLink({
        subdomain,
      }),
    },
    {
      icon: "i-mingcute-trophy-line",
      name: "Achievements",
      value: stat.data?.achievements ?? "-",
      url: `/dashboard/${subdomain}/achievements`,
    },
    {
      icon: "i-mingcute-eye-line",
      name: "Viewed",
      value: stat.data?.viewsCount ?? "-",
      url: getSiteLink({
        subdomain,
      }),
    },
    {
      icon: "i-mingcute-history-line",
      name: "Become xLogger for",
      value:
        date.dayjs().diff(date.dayjs(stat.data?.createdAt), "day") +
        " " +
        t("days"),
      url: `${CSB_SCAN}/tx/${stat.data?.createTx}`,
    },
  ]

  const pages = useGetPagesBySite({
    type: "post",
    characterId: 32022,
    limit: 4,
  })

  const showcaseSites = useGetShowcase()

  return (
    <DashboardMain title="Dashboard" className="max-w-screen-2xl">
      <div className="min-w-[270px] flex flex-col xl:flex-row space-y-8 xl:space-y-0">
        <div className="flex-1 space-y-8 min-w-0">
          <div className="grid gap-4 sm:grid-cols-3 grid-cols-2">
            {statMap.map((item) => (
              <UniLink
                href={item.url}
                key={item.name}
                className="bg-slate-100 rounded-lg flex justify-center flex-col py-4 px-6"
              >
                <span>
                  <i
                    className={cn(
                      item.icon,
                      "inline-block mr-1 text-lg align-middle",
                    )}
                  />
                  <span className="align-middle">{t(item.name)}</span>
                </span>
                <span className="font-bold text-2xl">{item.value}</span>
              </UniLink>
            ))}
          </div>
          <Heatmap characterId={characterId} />
          <div className="prose p-6 bg-slate-50 rounded-lg relative">
            {t.rich("hello.welcome", {
              p: (chunks) => <p>{chunks}</p>,
            })}
            <ul>
              <li>
                <UniLink
                  href={getSiteLink({
                    subdomain,
                  })}
                >
                  {t("View Site")}
                </UniLink>
              </li>
              <li>
                <UniLink href={`/dashboard/${subdomain}/editor?type=post`}>
                  {t("Create a Post")}
                </UniLink>
              </li>
              <li>
                <UniLink href={`/dashboard/${subdomain}/settings/general`}>
                  {t("Change Site Icon or domain")}
                </UniLink>
              </li>
            </ul>
            {t.rich("hello.community", {
              p: (chunks) => <p>{chunks}</p>,
            })}
            <ul
              style={{
                marginBottom: 0,
              }}
            >
              <li>
                <UniLink href="/" target="_blank">
                  {t("Check out the updates of other bloggers")}
                </UniLink>
              </li>
              <li>
                <UniLink href={DISCORD_LINK}>
                  {t("Join xLog's Discord channel")}
                </UniLink>
              </li>
              <li>
                <UniLink href={GITHUB_LINK}>
                  {t("Participate in the development of xLog")}
                </UniLink>
              </li>
              <li>
                <UniLink href={TWITTER_LINK}>
                  {t("Follow xLog's Twitter")}
                </UniLink>
              </li>
            </ul>
            <div></div>
          </div>
        </div>
        <div className="w-full xl:w-[500px] xl:ml-10 space-y-7">
          <div className="p-6 bg-slate-50 rounded-lg relative">
            <UniLink
              href={getSiteLink({ subdomain: "xlog" })}
              className="absolute inset-x-0 top-0 h-16 cursor-pointer"
            >
              <div className="absolute right-5 top-5 text-sm font-bold">
                {t("More")}
              </div>
            </UniLink>
            <h4 className="text-xl font-bold mb-4 leading-none">
              {t("xLog News")}
            </h4>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {pages.data?.pages[0]?.list.map((item) => (
                <UniLink
                  href={`${getSiteLink({ subdomain: "xlog" })}/${
                    item.metadata?.content?.slug
                  }`}
                  key={item.transactionHash}
                  className="bg-slate-100 rounded-lg flex flex-col py-4 px-6"
                >
                  {item.metadata?.content?.cover && (
                    <div className="w-full h-24">
                      <Image
                        className="object-cover rounded"
                        alt="cover"
                        fill={true}
                        src={item.metadata?.content?.cover}
                      ></Image>
                    </div>
                  )}
                  <span className="font-bold text-sm text-zinc-800 leading-tight mt-4">
                    {item.metadata?.content?.title}
                  </span>
                </UniLink>
              ))}
            </div>
          </div>
          <div className="p-6 bg-slate-50 rounded-lg relative">
            <h4 className="text-xl font-bold mb-4 leading-none">
              {t("Meet New Friends")}
            </h4>
            <ul className="pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 relative">
              {showcaseSites.data?.slice(0, 6)?.map((site) => (
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
                          src={
                            site.metadata.content?.avatars?.[0] ||
                            DEFAULT_AVATAR
                          }
                          alt={site.handle}
                          width="56"
                          height="56"
                        ></Image>
                      </span>
                    </CharacterFloatCard>
                    <span className="ml-3 min-w-0 flex-1 justify-center inline-flex flex-col">
                      <span className="truncate w-full inline-block font-medium">
                        {site.metadata.content?.name}
                      </span>
                      {site.metadata.content?.bio && (
                        <span className="text-gray-500 text-xs truncate w-full inline-block mt-1">
                          {site.metadata.content?.bio}
                        </span>
                      )}
                    </span>
                  </UniLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardMain>
  )
}
