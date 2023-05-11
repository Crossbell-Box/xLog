import { SitePage } from "~/components/site/SitePage"
import { SITE_URL } from "~/lib/env"
import { useTranslation } from "~/lib/i18n"

export default async function NotFound() {
  const { t } = await useTranslation("site")

  return (
    <SitePage
      page={
        {
          metadata: {
            content: {
              title: t("404 - Whoops, this page is gone."),
              content: `
- [Back to Home](/)
- [All posts](/archives)

![image](${SITE_URL}/assets/404.svg)`,
            },
          },
        } as any
      }
    />
  )
}
