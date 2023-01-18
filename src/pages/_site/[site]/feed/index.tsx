import { GetServerSideProps } from "next"
import { getJsonFeed } from "~/lib/json-feed"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  ctx.res.setHeader("Content-Type", "application/feed+json; charset=utf-8")
  ctx.res.setHeader("Access-Control-Allow-Methods", "GET")
  ctx.res.setHeader("Access-Control-Allow-Origin", "*")
  ctx.res.setHeader("Cache-Control", "public, max-age=1800")
  const domainOrSubdomain = ctx.params!.site as string

  ctx.res.write(JSON.stringify(await getJsonFeed(domainOrSubdomain, "/feed")))
  ctx.res.end()

  return {
    props: {},
  }
}

const SiteFeed: React.FC = () => null

export default SiteFeed
