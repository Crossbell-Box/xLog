import { Contract, Indexer, Network } from "crossbell.js"
import { IPFS_GATEWAY } from "../lib/env"

Network.setIpfsGateway(IPFS_GATEWAY)

const indexer = new Indexer()

let contract: Contract | undefined

const getContract = async () => {
  if (!contract && typeof window !== "undefined") {
    contract = new Contract((<any>window).ethereum)
    await contract.connect()
  }
  return contract
}

export { indexer, getContract }
