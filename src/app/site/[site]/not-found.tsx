import { PageContent } from "~/components/common/PageContent"
import { SITE_URL } from "~/lib/env"
import { useTranslation } from "~/lib/i18n"

export default async function NotFound() {
  const { t } = await useTranslation("site")

  return (
    <>
      <article>
        <div>
          <h2 className="xlog-post-title text-xl font-bold page-title">
            {t("404 - Whoops, this page is gone.")}
          </h2>
        </div>
        <PageContent
          className="mt-10"
          content={`
- [${t("Back to Home")}](/)
- [${t("All Posts")}](/archives)
- [${t("Search Posts")}](/search)

![image](${SITE_URL}/assets/404.svg)`}
          toc={true}
        ></PageContent>
      </article>
    </>
  )
}
