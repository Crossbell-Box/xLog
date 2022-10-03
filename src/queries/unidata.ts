import Unidata from "unidata.js"
import { useAccount } from "wagmi"
import { IPFS_SW_GATEWAY_PREFIX } from "../lib/ipfs-gateway"
import { IPFS_GATEWAY } from "../lib/env"

let unidata: Unidata

export const useUnidata = () => {
  const { connector, isConnected } = useAccount()
  if (isConnected && connector) {
    connector?.getProvider().then((provider) => {
      unidata = new Unidata({
        ipfsGateway: IPFS_SW_GATEWAY_PREFIX,
        ethereumProvider: provider,
      })
    })
  } else {
    unidata = new Unidata({
      ipfsGateway:
        typeof window === "undefined" ? IPFS_GATEWAY : IPFS_SW_GATEWAY_PREFIX,
    })
  }
  return unidata
}
