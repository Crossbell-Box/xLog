import { GetServerSideProps } from "next"
// @ts-ignore
import jsonfeedToRSS from "jsonfeed-to-rss"
import { getJsonFeed } from "~/lib/json-feed"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  ctx.res.setHeader("Content-Type", "application/xml; charset=utf-8")
  ctx.res.setHeader("Access-Control-Allow-Methods", "GET")
  ctx.res.setHeader("Access-Control-Allow-Origin", "*")
  const domainOrSubdomain = ctx.params!.site as string

  ctx.res.write(
    jsonfeedToRSS(await getJsonFeed(domainOrSubdomain, "/feed/xml")),
  )
  ctx.res.end()

  return {
    props: {},
  }
}

const SiteFeed: React.FC = () => null

export default SiteFeed
