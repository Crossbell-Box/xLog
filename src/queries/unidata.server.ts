import Unidata from "unidata.js"
import { IPFS_GATEWAY } from "../lib/env"

export default new Unidata({
  ipfsGateway: IPFS_GATEWAY,
})
