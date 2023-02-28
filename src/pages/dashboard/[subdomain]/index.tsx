import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { UniLink } from "~/components/ui/UniLink"
import Image from "next/image"
import { DISCORD_LINK, TWITTER_LINK, GITHUB_LINK, APP_NAME } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import type { ReactElement } from "react"
import { useGetSite, useGetStat } from "~/queries/site"
import { useDate } from "~/hooks/useDate"
import { useTranslation, Trans } from "next-i18next"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { GetServerSideProps } from "next"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { Logo } from "~/components/common/Logo"

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

  return (
    <DashboardMain>
      <div className="prose min-w-[270px] max-w-screen-md">
        <div className="w-14 h-14 mb-8">
          <Logo type="lottie" width={56} height={56} />
        </div>
        <p className="text-2xl font-bold">{t("Site Stats")}</p>
        <div className="grid gap-4 sm:grid-cols-3 grid-cols-2 mb-8">
          {statMap.map((item) => (
            <div
              key={item.name}
              className="bg-slate-100 rounded-lg flex justify-center flex-col py-4 px-6"
            >
              <span>{t(item.name)}</span>
              <span className="font-bold text-2xl text-accent">
                {item.value}
              </span>
            </div>
          ))}
        </div>
        <Trans
          i18nKey="hello.welcome"
          defaults="<p>Hello there,</p><p>Welcome to use xLog!</p><p>Here're some useful links to get started:</p>"
          components={{
            p: <p />,
          }}
          ns="dashboard"
        />
        <ul>
          <li>
            <UniLink href={`/dashboard/${subdomain}/editor?type=post`}>
              Create a Post
            </UniLink>
          </li>
          <li>
            <UniLink href={`/dashboard/${subdomain}/settings/general`}>
              Change Site Name or Icon
            </UniLink>
          </li>
          <li>
            Subscribe the{" "}
            <UniLink
              href={`${getSiteLink({
                subdomain: subdomain,
              })}/feed`}
            >
              posts feed
            </UniLink>{" "}
            and{" "}
            <UniLink
              href={`${getSiteLink({
                subdomain: subdomain,
              })}/feed/notifications`}
            >
              notifications feed
            </UniLink>{" "}
            via RSS Reader
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
        <ul>
          <li>
            <UniLink href={DISCORD_LINK}>
              Join {APP_NAME}
              {`'`}s Discord channel
            </UniLink>
          </li>
          <li>
            <UniLink
              href={getSiteLink({
                subdomain: "xlog",
              })}
            >
              Follow {APP_NAME}
              {`'`}s xLog
            </UniLink>
          </li>
          <li>
            <UniLink href={GITHUB_LINK}>
              View {APP_NAME}
              {`'`}s source code or participate in its development
            </UniLink>
          </li>
          <li>
            <UniLink href={TWITTER_LINK}>
              Follow {APP_NAME}
              {`'`}s Twitter
            </UniLink>
          </li>
        </ul>
      </div>
    </DashboardMain>
  )
}

SubdomainIndex.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Dashboard">{page}</DashboardLayout>
}
