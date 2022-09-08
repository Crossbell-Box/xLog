import Unidata from "unidata.js"

import { IPFS_GATEWAY } from "../lib/env"
import { IPFS_SW_GATEWAY_PREFIX } from "../lib/ipfs-gateway"

let unidata = new Unidata({
  ipfsGateway:
    typeof window === "undefined" ? IPFS_GATEWAY : IPFS_SW_GATEWAY_PREFIX,
})

export default unidata
