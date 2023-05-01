// @ts-ignore
import jsonfeedToRSS from "jsonfeed-to-rss"
import { GetServerSideProps } from "next"

import { getJsonFeed, setHeader } from "~/lib/json-feed"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  setHeader(ctx)
  const domainOrSubdomain = ctx.params!.site as string

  const data = await getJsonFeed(domainOrSubdomain, "/feed")

  ctx.res.write(
    ctx.query.format === "xml" ? jsonfeedToRSS(data) : JSON.stringify(data),
  )
  ctx.res.end()

  return {
    props: {},
  }
}

const SiteFeed: React.FC = () => null

export default SiteFeed
