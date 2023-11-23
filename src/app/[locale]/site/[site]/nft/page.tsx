import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { Image } from "~/components/ui/Image"
import { UniLink } from "~/components/ui/UniLink"
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
  const t = await getTranslations()

  let nfts = (await getNFTs(site?.owner)) ?? {
    nfts: [],
    chains: [],
  }

  return (
    <>
      <h2 className="page-title">NFT {t("Showcase")}</h2>
      <div className="mt-8 text-zinc-500 text-sm mb-8">
        <span className="font-medium">Supported chains:</span>{" "}
        {nfts.chains.join(", ")}
      </div>
      <div>
        <div className="grid grid-cols-4 md:grid-cols-5 gap-8">
          {nfts.nfts.map((nft) => (
            <UniLink
              key={nft.nft_id}
              className="xlog-nft flex items-center flex-col"
              href={
                nft.external_url ||
                nft.collection?.external_url ||
                nft.collection?.marketplace_pages?.[0]?.nft_url ||
                nft.collection?.marketplace_pages?.[0]?.collection_url
              }
              data-collection={nft.contract_address.toLowerCase()}
              data-token-id={nft.token_id}
              data-name={nft.name}
            >
              <div className="w-full aspect-[1] relative rounded overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 right-0">
                  <Image
                    className="object-cover no-optimization w-full h-full rounded-2xl"
                    alt={"nft"}
                    src={nft.previews.image_medium_url}
                    fill={true}
                  />
                </div>
              </div>
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
