import { IPFS_GATEWAY } from "~/lib/env"

export const toGateway = (url: string) => {
  return url
    ?.replace("ipfs://", IPFS_GATEWAY)
    .replace("https://gateway.ipfs.io/ipfs/", IPFS_GATEWAY)
    .replace("https://ipfs.io/ipfs/", IPFS_GATEWAY)
    .replace("https://cf-ipfs.com/ipfs/", IPFS_GATEWAY)
    .replace("https://ipfs.4everland.io/ipfs/", IPFS_GATEWAY)
}

export const toIPFS = (url: string) => {
  return url?.replace(IPFS_GATEWAY, "ipfs://")
}
