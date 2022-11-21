import { IPFS_GATEWAY } from "~/lib/env"

const IPFS_PREFIX = "ipfs://"

export type ToGatewayConfig = {
  needRequestAtServerSide?: boolean
  forceFallback?: boolean
}

export const toGateway = (url: string) => {
  const ipfsUrl = toIPFS(url)

  return ipfsUrl.replaceAll(IPFS_PREFIX, IPFS_GATEWAY)
}

export const toIPFS = (url: string) => {
  return url
    ?.replaceAll(IPFS_GATEWAY, IPFS_PREFIX)
    .replaceAll("https://gateway.ipfs.io/ipfs/", IPFS_PREFIX)
    .replaceAll("https://ipfs.io/ipfs/", IPFS_PREFIX)
    .replaceAll("https://cf-ipfs.com/ipfs/", IPFS_PREFIX)
    .replaceAll("https://ipfs.4everland.xyz/ipfs/", IPFS_PREFIX)
    .replaceAll("https://rss3.mypinata.cloud/ipfs/", IPFS_PREFIX)
}
