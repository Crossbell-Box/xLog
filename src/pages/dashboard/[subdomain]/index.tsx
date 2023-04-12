import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { UniLink } from "~/components/ui/UniLink"
import { Image } from "~/components/ui/Image"
import { DISCORD_LINK, TWITTER_LINK, GITHUB_LINK, APP_NAME } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import type { ReactElement } from "react"
import { useGetSite, useGetStat } from "~/queries/site"
import { useDate } from "~/hooks/useDate"
import { useTranslation, Trans } from "next-i18next"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { GetServerSideProps } from "next"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { useGetPagesBySite } from "~/queries/page"
import showcase from "../../../../data/showcase.json"
import { useGetSites } from "~/queries/site"
import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const { props: layoutProps } = await getLayoutServerSideProps(ctx)

    return {
      props: {
        ...layoutProps,
      },
    }
  },
)

export default function SubdomainIndex() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string
  const site = useGetSite(subdomain)
  const characterId = site.data?.metadata?.proof
  const stat = useGetStat({
    characterId,
  })
  const date = useDate()
  const { t } = useTranslation("dashboard")
  const statMap = [
    {
      name: "Total Posts",
      value: stat.data?.notesCount,
    },
    {
      name: "Total Comments",
      value: stat.data?.commentsCount,
    },
    {
      name: "Total Followers",
      value: stat.data?.subscriptionCount,
    },
    {
      name: "Total Views",
      value: stat.data?.viewsCount,
    },
    {
      name: "Site Duration",
      value:
        date.dayjs().diff(date.dayjs(stat.data?.createdAt), "day") +
        " " +
        t("days"),
    },
  ]

  const pages = useGetPagesBySite({
    type: "post",
    site: "xlog",
    take: 4,
  })

  const showcaseSites = useGetSites(showcase)

  return (
    <DashboardMain title="Dashboard" className="max-w-screen-2xl">
      <div className="min-w-[270px] flex flex-col xl:flex-row space-y-8 xl:space-y-0">
        <div className="flex-1 space-y-8">
          <div className="grid gap-4 sm:grid-cols-3 grid-cols-2">
            {statMap.map((item) => (
              <div
                key={item.name}
                className="bg-slate-100 rounded-lg flex justify-center flex-col py-4 px-6"
              >
                <span>{t(item.name)}</span>
                <span className="font-bold text-2xl">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="prose p-6 bg-slate-50 rounded-lg relative">
            <Trans
              i18nKey="hello.welcome"
              defaults="<p>👋 Hello there,</p><p>Welcome to use xLog!</p><p>Here're some useful links to get started:</p>"
              components={{
                p: <p />,
              }}
              ns="dashboard"
            />
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
            <Trans
              i18nKey="hello.community"
              defaults="<p>Join the community to meet friends or build xLog together:</p>"
              components={{
                p: <p />,
              }}
              ns="dashboard"
            />
            <ul
              style={{
                marginBottom: 0,
              }}
            >
              <li>
                <UniLink href="/activities" target="_blank">
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
              className="absolute right-0 left-0 top-0 h-16 cursor-pointer"
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
                  href={`${getSiteLink({ subdomain: "xlog" })}/${item.slug}`}
                  key={item.id}
                  className="bg-slate-100 rounded-lg flex flex-col py-4 px-6"
                >
                  {item.cover && (
                    <div className="w-full h-24">
                      <Image
                        className="object-cover rounded"
                        alt="cover"
                        fill={true}
                        src={item.cover}
                      ></Image>
                    </div>
                  )}
                  <span className="font-bold text-sm text-zinc-800 leading-tight mt-4">
                    {item.title}
                  </span>
                </UniLink>
              ))}
            </div>
          </div>
          <div className="p-6 bg-slate-50 rounded-lg relative">
            <h4 className="text-xl font-bold mb-4 leading-none">
              {t("Meet New Friends")}
            </h4>
            <ul className="pt-2 grid grid-cols-3 gap-6 relative">
              {showcaseSites.data?.slice(0, 6)?.map((site: any) => (
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
                            site.metadata.content?.avatars?.[0] ||
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

SubdomainIndex.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Dashboard">{page}</DashboardLayout>
}
