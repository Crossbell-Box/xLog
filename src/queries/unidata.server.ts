import Unidata from "unidata.js"
import { IPFS_GATEWAY } from "../lib/env"
import {
  MORALIS_WEB3_API_KEY,
  ALCHEMY_ETHEREUM_API_KEY,
  ALCHEMY_POLYGON_API_KEY,
  NFTSCAN_API_KEY,
  OPENSEA_API_KEY,
} from "../lib/env.server"

export default new Unidata({
  ipfsGateway: IPFS_GATEWAY,
  moralisWeb3APIKey: MORALIS_WEB3_API_KEY,
  alchemyEthereumAPIKey: ALCHEMY_ETHEREUM_API_KEY,
  alchemyPolygonAPIKey: ALCHEMY_POLYGON_API_KEY,
  nftscanAPIKey: NFTSCAN_API_KEY,
  openseaAPIKey: OPENSEA_API_KEY,
})
