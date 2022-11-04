import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { UniLink } from "~/components/ui/UniLink"
import Image from "next/image"
import { DISCORD_LINK, TWITTER_LINK, GITHUB_LINK, APP_NAME } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"

export default function SubdomainIndex() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string
  return (
    <DashboardLayout title="Dashboard">
      <DashboardMain>
        <div className="prose max-w-screen-md">
          <div className="w-14 h-14 mb-8">
            <Image alt="logo" src="/logo.svg" width={100} height={100} />
          </div>
          <p>Hello there,</p>
          <p>
            This page is quite empty for now, but we will polish it very soon!
            Maybe some useful analytics!
          </p>
          <p>Here{`'`}re some useful links to get started:</p>
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
          <p>
            You are not alone, join the community to meet friends or give xLog
            some advice:
          </p>
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
    </DashboardLayout>
  )
}
