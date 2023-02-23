import type { GetServerSidePropsContext } from "next"
import url from "url"

export const languageDetector = (ctx: GetServerSidePropsContext) => {
  const queryLang = url.parse(ctx.req.url!, true).query.lang as string
  return (
    queryLang ||
    ctx.req.headers["accept-language"]?.split(",")[0].split("-")[0] ||
    "en"
  )
}
