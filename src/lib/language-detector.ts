import type { GetServerSidePropsContext } from "next"

export const languageDetector = (ctx: GetServerSidePropsContext) => {
  return ctx.req.headers["accept-language"]?.split(",")[0].split("-")[0] || "en"
}
