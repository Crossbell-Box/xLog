import { Image } from "~/components/ui/Image"
import { SITE_URL } from "~/lib/env"
import { getTranslation } from "~/lib/i18n"

export default async function NotFound() {
  const { t } = await getTranslation("site")

  return (
    <>
      <article>
        <div>
          <h2 className="xlog-post-title text-xl font-bold page-title text-center">
            {t("404 - Whoops, this page is gone.")}
          </h2>
        </div>
        <div className="mt-10 xlog-post-content prose">
          <ul>
            <li>
              <a href="/">{t("Back to Home")}</a>
            </li>
            <li>
              <a href="/archives">{t("All Posts")}</a>
            </li>
            <li>
              <a href="/search">{t("Search Posts")}</a>
            </li>
            <Image alt="404" src={`${SITE_URL}/assets/404.svg`} />
          </ul>
        </div>
      </article>
    </>
  )
}
