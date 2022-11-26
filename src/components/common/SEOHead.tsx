import Head from "next/head"
import { SITE_URL } from "~/lib/env"

export const SEOHead: React.FC<{
  siteName: string
  title: string | undefined
  description?: string | null
  image?: string | null
  icon?: string | null
}> = ({ siteName, title, description, image, icon }) => {
  return (
    <Head>
      <title>{title ? `${title} - ${siteName}` : siteName}</title>
      <meta name="og:site_name" content={siteName} />
      <meta name="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      <meta name="description" content={description || ""} />
      <meta name="og:description" content={description || ""} />
      <meta name="twitter:description" content={description || ""} />
      <meta name="twitter:card" content="summary_large_image" />
      {image && (
        <>
          <meta name="og:image" content={new URL(image, SITE_URL).toString()} />
          <meta
            name="twitter:image"
            content={new URL(image, SITE_URL).toString()}
          />
        </>
      )}
      <link
        rel="alternate"
        href="/feed/xml"
        title={siteName}
        type="application/rss+xml"
      ></link>
      <link
        rel="alternate"
        href="/feed"
        title={siteName}
        type="application/feed+json"
      ></link>
      <link
        rel="alternate"
        href="/feed"
        title={`Notifications on ${siteName}`}
        type="application/feed+json"
      ></link>
      <link rel="icon" href={icon || `${SITE_URL}/logo.svg`}></link>
    </Head>
  )
}
