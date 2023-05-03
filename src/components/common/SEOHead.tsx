import Head from "next/head"

import { SITE_URL } from "~/lib/env"

export const SEOHead: React.FC<{
  siteName: string
  title: string | undefined
  description?: string | null
  image?: string | null
  icon?: string | null
  site?: string
}> = ({ siteName, title, description, image, icon, site }) => {
  return (
    <Head>
      <title>{title ? `${title} - ${siteName}` : `${siteName}`}</title>
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
      <link rel="icon" href={icon || `${SITE_URL}/assets/logo.svg`}></link>
      {site ? (
        <>
          <link
            rel="alternate"
            href="/feed"
            title={siteName}
            type="application/feed+json"
          ></link>
          <link
            rel="alternate"
            href="/feed?format=xml"
            title={siteName}
            type="application/rss+xml"
          ></link>
          <link
            rel="alternate"
            href="/feed/comments"
            title={`Comments on ${siteName}`}
            type="application/feed+json"
          ></link>
          <link
            rel="alternate"
            href="/feed/comments?format=xml"
            title={`Comments on ${siteName}`}
            type="application/rss+xml"
          ></link>
          <link rel="manifest" href="/manifest.json" />
        </>
      ) : (
        <>
          <link
            rel="alternate"
            href="/feed/latest"
            title="xLog Latest"
            type="application/feed+json"
          ></link>
          <link
            rel="alternate"
            href="/feed/latest?format=xml"
            title="xLog Latest"
            type="application/rss+xml"
          ></link>
          <link
            rel="alternate"
            href="/feed/hottest/0"
            title="xLog Hot"
            type="application/feed+json"
          ></link>
          <link
            rel="alternate"
            href="/feed/hottest/0?format=xml"
            title="xLog Hot"
            type="application/rss+xml"
          ></link>
          <link
            rel="alternate"
            href="/feed/hottest/1"
            title="xLog Daily Hot"
            type="application/feed+json"
          ></link>
          <link
            rel="alternate"
            href="/feed/hottest/1?format=xml"
            title="xLog Daily Hot"
            type="application/rss+xml"
          ></link>
          <link
            rel="alternate"
            href="/feed/hottest/7"
            title="xLog Weekly Hot"
            type="application/feed+json"
          ></link>
          <link
            rel="alternate"
            href="/feed/hottest/7?format=xml"
            title="xLog Weekly Hot"
            type="application/rss+xml"
          ></link>
          <link
            rel="alternate"
            href="/feed/hottest/30"
            title="xLog Monthly Hot"
            type="application/feed+json"
          ></link>
          <link
            rel="alternate"
            href="/feed/hottest/30?format=xml"
            title="xLog Monthly Hot"
            type="application/rss+xml"
          ></link>
        </>
      )}
    </Head>
  )
}
