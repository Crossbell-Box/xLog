import { IpfsGateway } from "@crossbell/ipfs-gateway"

export const IPFS_SW_GATEWAY_PREFIX = "/_ipfs/"

export const ipfsGateway = new IpfsGateway({
  serviceWorker: {
    gatewayPrefix: IPFS_SW_GATEWAY_PREFIX,
  },
})
