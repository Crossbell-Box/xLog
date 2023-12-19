import { HomeFeed } from "~/components/home/HomeFeed"
import { APP_NAME } from "~/lib/env"
import { withHrefLang } from "~/lib/with-hreflang"

export const generateMetadata = withHrefLang(async () => ({
  title: `Following Activities - ${APP_NAME}`,
}))

export default async function FollowingActivities() {
  return <HomeFeed type="following" />
}
