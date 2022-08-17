import Unidata from "unidata.js"
import { IPFS_GATEWAY } from "../lib/env"

let unidata = new Unidata({
  ipfsGateway: IPFS_GATEWAY,
})

export default unidata
