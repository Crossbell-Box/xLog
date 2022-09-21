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
      <meta name="twitter:card" content="summary" />
      {image && (
        <>
          <meta name="og:image" content={image} />
          <meta name="twitter:image" content={image} />
        </>
      )}
      <link
        rel="alternate"
        href="/feed"
        title={title}
        type="application/feed+json"
      ></link>
      <link rel="icon" href={icon || `${SITE_URL}/logo.svg`}></link>
    </Head>
  )
}
