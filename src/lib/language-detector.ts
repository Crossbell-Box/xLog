import type { GetServerSidePropsContext } from "next"
import url from "url"

export const languageDetector = (ctx: GetServerSidePropsContext) => {
  const queryLang = url.parse(ctx.req.url!, true).query.lang as string

  let acceptLang = ctx.req.headers["accept-language"]?.split(",")[0]

  if (acceptLang === "zh-CN") {
    acceptLang = "zh"
  } else if (acceptLang === "zh-HK") {
    acceptLang = "zh-TW"
  } else if (acceptLang === "zh-TW") {
    // do nothing
  } else {
    acceptLang = acceptLang?.split("-")[0]
  }

  return queryLang || acceptLang || "en"
}
