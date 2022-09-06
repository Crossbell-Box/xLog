import { IpfsGateway } from "@crossbell/ipfs-gateway"

export const ipfsGateway = new IpfsGateway({
  serviceWorker: {
    gatewayPrefix: "/_ipfs/",
  },
})
