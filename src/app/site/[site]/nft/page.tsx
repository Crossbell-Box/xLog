import { Metadata } from "next"
import Script from "next/script"

import { UniLink } from "~/components/ui/UniLink"
import { UniMedia } from "~/components/ui/UniMedia"
import { getTranslation } from "~/lib/i18n"
import { toGateway } from "~/lib/ipfs-parser"
import getQueryClient from "~/lib/query-client"
import { fetchGetSite, getNFTs } from "~/queries/site.server"

export async function generateMetadata({
  params,
}: {
  params: {
    site: string
  }
}): Promise<Metadata> {
  const queryClient = getQueryClient()

  const site = await fetchGetSite(params.site, queryClient)

  const title = `NFT - ${site?.metadata?.content?.name || site?.handle}`

  return {
    title,
  }
}

export default async function SiteNFTPage({
  params,
}: {
  params: {
    site: string
  }
}) {
  const queryClient = getQueryClient()

  const site = await fetchGetSite(params.site, queryClient)
  const { t } = await getTranslation("common")

  let nfts = (await getNFTs(site?.owner)) ?? []

  const names = new Map<string, boolean>()
  nfts.forEach((chain: any) => {
    if (!names.get(chain.chain)) {
      names.set(chain.chain, true)
      chain.assets = []
      chain.collection_assets.forEach((collection: any) => {
        chain.assets = chain.assets.concat(collection.assets)
      })
      chain.assets = chain.assets.filter((asset: any) => asset.content_uri)
    }
  })
  nfts = nfts
    .filter((chain: any) => chain.assets?.length)
    .sort((a: any, b: any) => b.assets.length - a.assets.length)

  const displayNames: Record<string, string> = {
    eth: "Ethereum",
    bsc: "BNB Chain",
    pls: "Polygon",
    arbi: "Arbitrum One",
    opti: "Optimism",
    avax: "Avalanche",
    cro: "Cronos",
    platon: "PlatON",
    glmr: "Moonbeam",
    ftm: "Fantom",
    gnosis: "Gnosis",
  }

  return (
    <>
      <Script
        type="module"
        src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js"
      ></Script>
      <h2 className="page-title">NFT {t("Showcase")}</h2>
      <div className="mt-8 text-zinc-500 text-sm">
        <span className="font-medium">Supported chains:</span>{" "}
        {Object.values(displayNames).join(", ")}
      </div>
      <div>
        {nfts.map((chain: any) => (
          <div
            key={chain.chain}
            className="flex flex-col"
            data-network={chain.chain}
          >
            <details open>
              <summary>
                <span className="inline-block text-2xl font-bold my-8 pl-2">
                  {displayNames[chain.chain] || chain.chain} (
                  {chain.assets.length})
                </span>
              </summary>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-10">
                {chain.assets.map((nft: any) => (
                  <UniLink
                    key={nft.mint_transaction_hash}
                    className="xlog-nft flex items-center flex-col"
                    href={nft.external_link}
                    data-collection={nft.contract_address}
                    data-token-id={nft.token_id}
                    data-name={nft.name}
                  >
                    <UniMedia
                      src={
                        nft.content_uri?.startsWith?.("http") ||
                        nft.content_uri?.startsWith?.("data:")
                          ? nft.content_uri
                          : nft.content_uri?.startsWith?.("<svg")
                          ? `data:image/svg+xml,${encodeURIComponent(
                              nft.content_uri,
                            )}` || ""
                          : toGateway(`ipfs://${nft.content_uri}`) || ""
                      }
                      mime_type={nft.content_type}
                    />
                    <div className="text-xs mt-2 text-center font-medium">
                      {nft.name}
                    </div>
                  </UniLink>
                ))}
              </div>
            </details>
          </div>
        ))}
      </div>
    </>
  )
}
