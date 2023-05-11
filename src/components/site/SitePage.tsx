import serialize from "serialize-javascript"

import { PageContent } from "~/components/common/PageContent"
import { PostFooter } from "~/components/site/PostFooter"
import PostMeta from "~/components/site/PostMeta"
import { getSiteLink } from "~/lib/helpers"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"

export function SitePage({
  page,
  site,
}: {
  page?: ExpandedNote
  site?: ExpandedCharacter
}) {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={addPageJsonLd()}
      />
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
          {page?.metadata?.content?.tags?.includes("post") && (
            /* @ts-expect-error Async Server Component */
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
