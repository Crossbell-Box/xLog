import { GetServerSideProps } from "next"

import { getJsonFeed, setHeader } from "~/lib/json-feed"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  setHeader(ctx)
  const domainOrSubdomain = ctx.params!.site as string

  ctx.res.write(JSON.stringify(await getJsonFeed(domainOrSubdomain, "/feed")))
  ctx.res.end()

  return {
    props: {},
  }
}

const SiteFeed: React.FC = () => null

export default SiteFeed
