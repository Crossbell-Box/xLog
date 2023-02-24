import { GetServerSideProps } from "next"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/site/SiteLayout.server"
import { QueryClient } from "@tanstack/react-query"
import { useGetSite, useGetNFTs } from "~/queries/site"
import { ReactElement, useEffect, useState } from "react"
import type { Asset } from "unidata.js"
import Script from "next/script"
import { UniMedia } from "~/components/ui/UniMedia"
import { UniLink } from "~/components/ui/UniLink"
import { useTranslation } from "next-i18next"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  const domainOrSubdomain = ctx.params!.site as string
  const { props: layoutProps } = await getLayoutServerSideProps(
    ctx,
    queryClient,
    {
      skipPages: true,
    },
  )

  return {
    props: {
      ...layoutProps,
      domainOrSubdomain,
    },
  }
}

function SiteNFTPage({ domainOrSubdomain }: { domainOrSubdomain: string }) {
  const site = useGetSite(domainOrSubdomain)
  const { t } = useTranslation(["common", "site"])

  const nftsOrigin = useGetNFTs(site.data?.metadata?.owner)

  const [nfts, setNfts] = useState<Asset[]>([])
  useEffect(() => {
    if (nftsOrigin?.data?.list && !nfts.length) {
      setNfts(nftsOrigin.data.list)
    }
  }, [nftsOrigin.data, nfts])

  return (
    <>
      <Script
        type="module"
        src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js"
      ></Script>
      <h2 className="text-xl font-bold page-title">NFT {t("Showcase")}</h2>
      <div className="mt-8">
        {nftsOrigin.isLoading ? (
          <div>{t("Loading")}...</div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-10">
            {nfts
              .filter((nft) => nft.items?.[0]?.address)
              .map((nft: Asset) => (
                <UniLink
                  key={nft.metadata?.proof}
                  className="xlog-nft flex items-center flex-col"
                  href={nft.related_urls?.[nft.related_urls.length - 1]}
                  data-collection={nft.metadata?.collection_address}
                  data-network={nft.metadata?.network}
                  data-token-id={nft.metadata?.token_id}
                  data-name={nft.name}
                >
                  <UniMedia
                    src={nft.items?.[0]?.address || ""}
                    mime_type={nft.items?.[0].mime_type}
                  />
                  <div className="text-xs mt-2 text-center font-medium">
                    {nft.name}
                  </div>
                </UniLink>
              ))}
          </div>
        )}
      </div>
    </>
  )
}

SiteNFTPage.getLayout = (page: ReactElement) => {
  return <SiteLayout type="nft">{page}</SiteLayout>
}

export default SiteNFTPage
