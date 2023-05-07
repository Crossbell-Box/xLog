import Script from "next/script"
import type { Asset } from "unidata.js"

import { UniLink } from "~/components/ui/UniLink"
import { UniMedia } from "~/components/ui/UniMedia"
import { useTranslation } from "~/lib/i18n"
import getQueryClient from "~/lib/query-client"
import { fetchGetSite, getNFTs } from "~/queries/site.server"

export default async function SiteNFTPage({
  params,
}: {
  params: {
    site: string
  }
}) {
  const queryClient = getQueryClient()

  const site = await fetchGetSite(params.site, queryClient)
  const { t } = await useTranslation("common")

  const nfts = await getNFTs(site?.owner)

  return (
    <>
      <Script
        type="module"
        src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js"
      ></Script>
      <h2 className="text-xl font-bold page-title">NFT {t("Showcase")}</h2>
      <div className="mt-8">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-10">
          {nfts.list
            ?.filter((nft: Asset) => nft.items?.[0]?.address)
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
      </div>
    </>
  )
}
