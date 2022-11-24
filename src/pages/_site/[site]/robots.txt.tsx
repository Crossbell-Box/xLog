import { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  ctx.res.setHeader("Content-Type", "text/plain")
  ctx.res.setHeader("Access-Control-Allow-Methods", "GET")
  ctx.res.setHeader("Access-Control-Allow-Origin", "*")

  ctx.res.write(`User-agent: *
Disallow: /dashboard/
Disallow: /preview/

Sitemap: https://${ctx.req.headers.host}/sitemap.xml`)
  ctx.res.end()

  return {
    props: {},
  }
}

const RobotsTxt: React.FC = () => null

export default RobotsTxt
