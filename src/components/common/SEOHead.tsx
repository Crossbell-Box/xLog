import Head from "next/head"

export const SEOHead: React.FC<{
  title: string
  description?: string | null
  image?: string | null
}> = ({ title, description, image }) => {
  return (
    <Head>
      <title>{title}</title>
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
    </Head>
  )
}
