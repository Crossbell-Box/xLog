import { PageContent } from "../common/PageContent"
import { PostMeta } from "./PostMeta"
import { PostFooter } from "./PostFooter"
import { Note, Profile } from "~/lib/types"
import Head from "next/head"
import { useGetUserSites } from "~/queries/site"
import { getSiteLink } from "~/lib/helpers"

export const SitePage: React.FC<{
  page?: Note | null
  site?: Profile | null
}> = ({ page, site }) => {
  // const author = useGetUserSites(page?.authors?.[0])

  function addPageJsonLd() {
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: page?.title,
        ...(page?.cover && {
          image: [page?.cover],
        }),
        datePublished: page?.date_published,
        dateModified: page?.date_updated,
        author: [
          {
            "@type": "Person",
            name: site?.name,
            url: getSiteLink({
              subdomain: site?.username || "",
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
      {page?.preview && (
        <div className="fixed top-0 left-0 w-full text-center text-orange-500 bg-gray-100 py-2 opacity-80 text-sm">
          Currently in private preview mode, the content is different from the
          public
        </div>
      )}
      <article>
        <div>
          {page?.tags?.includes("post") ? (
            <h2 className="xlog-post-title text-4xl font-bold">{page.title}</h2>
          ) : (
            <h2 className="xlog-post-title text-xl font-bold page-title">
              {page?.title}
            </h2>
          )}
          {page?.tags?.includes("post") && <PostMeta page={page} site={site} />}
        </div>
        <PageContent
          className="mt-10"
          content={page?.body?.content}
          toc={true}
        ></PageContent>
      </article>
      {page?.metadata && <PostFooter page={page} />}
    </>
  )
}
