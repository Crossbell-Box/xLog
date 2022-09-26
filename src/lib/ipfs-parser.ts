import { isIpfsUrl } from "@crossbell/ipfs-gateway"

import { IPFS_GATEWAY } from "~/lib/env"
import { ipfsGateway, IPFS_SW_GATEWAY_PREFIX } from "./ipfs-gateway"

const IPFS_PREFIX = "ipfs://"

export type ToGatewayConfig = {
  needRequestAtServerSide?: boolean
  forceFallback?: boolean
}

export const toGateway = (url: string, config?: ToGatewayConfig) => {
  const ipfsUrl = toIPFS(url)

  if (isIpfsUrl(ipfsUrl)) {
    if (
      (config?.needRequestAtServerSide && typeof window === "undefined") ||
      config?.forceFallback
    ) {
      return ipfsGateway.getFallbackWeb2Url(ipfsUrl)
    } else {
      return ipfsGateway.getSwWeb2Url(ipfsUrl)
    }
  } else {
    return url
  }
}

export const toIPFS = (url: string) => {
  return url
    ?.replace(IPFS_GATEWAY, IPFS_PREFIX)
    .replace(IPFS_SW_GATEWAY_PREFIX, IPFS_PREFIX)
    .replace("https://gateway.ipfs.io/ipfs/", IPFS_PREFIX)
    .replace("https://ipfs.io/ipfs/", IPFS_PREFIX)
    .replace("https://cf-ipfs.com/ipfs/", IPFS_PREFIX)
    .replace("https://ipfs.4everland.xyz/ipfs/", IPFS_PREFIX)
    .replace("https://rss3.mypinata.cloud/ipfs/", IPFS_PREFIX)
}
