import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { languageDetector } from "~/lib/language-detector"

export const getServerSideProps = async (ctx: any) => {
  return {
    props: {
      ...(await serverSideTranslations(languageDetector(ctx), [
        "common",
        "dashboard",
        "index",
      ])),
    },
  }
}
