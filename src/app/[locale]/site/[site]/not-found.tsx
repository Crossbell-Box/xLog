import { getTranslations } from "next-intl/server"

import PostTitle from "~/components/site/PostTitle"
import { Image } from "~/components/ui/Image"
import { SITE_URL } from "~/lib/env"
import { withHrefLang } from "~/lib/with-hreflang"

export const generateMetadata = withHrefLang(async () => {
  const t = await getTranslations()

  return {
    title: t("404 - Whoops, this page is gone"),
  }
})

export default async function NotFound() {
  const t = await getTranslations()

  return (
    <>
      <article>
        <PostTitle title="404 - Whoops, this page is gone" center={true} />
        <div className="xlog-post-content prose">
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
