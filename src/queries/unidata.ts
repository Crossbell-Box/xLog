import Unidata from "unidata.js"
import { useAccount } from "wagmi"
import { IPFS_GATEWAY } from "../lib/env"

let unidata: Unidata

export const useUnidata = () => {
  const { connector, isConnected } = useAccount()
  if (isConnected && connector) {
    connector?.getProvider().then((provider) => {
      unidata = new Unidata({
        ethereumProvider: provider,
      })
    })
  } else {
    unidata = new Unidata({
      ipfsGateway: IPFS_GATEWAY,
    })
  }
  return unidata
}
