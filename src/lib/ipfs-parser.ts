import { IPFS_GATEWAY } from "~/lib/env"

const IPFS_PREFIX = "ipfs://"

export type ToGatewayConfig = {
  needRequestAtServerSide?: boolean
  forceFallback?: boolean
}

export const toGateway = (url: string) => {
  const ipfsUrl = toIPFS(url)

  if (ipfsUrl.startsWith(IPFS_PREFIX)) {
    return url.replace(IPFS_PREFIX, IPFS_GATEWAY)
  } else {
    return url
  }
}

export const toIPFS = (url: string) => {
  return url
    ?.replace(IPFS_GATEWAY, IPFS_PREFIX)
    .replace("https://gateway.ipfs.io/ipfs/", IPFS_PREFIX)
    .replace("https://ipfs.io/ipfs/", IPFS_PREFIX)
    .replace("https://cf-ipfs.com/ipfs/", IPFS_PREFIX)
    .replace("https://ipfs.4everland.xyz/ipfs/", IPFS_PREFIX)
    .replace("https://rss3.mypinata.cloud/ipfs/", IPFS_PREFIX)
}
