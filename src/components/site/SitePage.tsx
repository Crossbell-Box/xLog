import { useTranslation } from "next-i18next"
import Head from "next/head"
import serialize from "serialize-javascript"

import { getSiteLink } from "~/lib/helpers"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"

import { PageContent } from "../common/PageContent"
import { PostFooter } from "./PostFooter"
import { PostMeta } from "./PostMeta"

export const SitePage: React.FC<{
  page?: ExpandedNote
  site?: ExpandedCharacter
  preview?: boolean
}> = ({ page, site, preview }) => {
  const { t } = useTranslation("site")

  function addPageJsonLd() {
    return {
      __html: serialize({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: page?.metadata?.content?.title,
        ...(page?.metadata?.content?.cover && {
          image: [page?.metadata?.content?.cover],
        }),
        datePublished: page?.metadata?.content?.date_published,
        dateModified: page?.updatedAt,
        author: [
          {
            "@type": "Person",
            name: site?.metadata?.content?.name,
            url: getSiteLink({
              subdomain: site?.handle || "",
            }),
          },
        ],
      }),
    }
  }

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={addPageJsonLd()}
        />
      </Head>
      {preview && (
        <div className="fixed top-0 left-0 w-full text-center text-red-500 bg-gray-100 py-2 opacity-80 text-sm z-10">
          {t(
            "This address is in local editing preview mode and cannot be viewed by the public.",
          )}
        </div>
      )}
      <article>
        <div>
          {page?.metadata?.content?.tags?.includes("post") ? (
            <h2 className="xlog-post-title text-4xl font-bold">
              {page.metadata?.content?.title}
            </h2>
          ) : (
            <h2 className="xlog-post-title text-xl font-bold page-title">
              {page?.metadata?.content?.title}
            </h2>
          )}
          {page?.metadata?.content?.tags?.includes("post") && !preview && (
            <PostMeta page={page} site={site} />
          )}
        </div>
        <PageContent
          className="mt-10"
          content={page?.metadata?.content?.content}
          toc={true}
        ></PageContent>
      </article>
      {page?.metadata && <PostFooter page={page} site={site} />}
    </>
  )
}
