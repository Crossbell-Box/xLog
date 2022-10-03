import { useAccount } from "wagmi"
import { Contract, Indexer, Network } from "crossbell.js"
import { IPFS_GATEWAY } from "../lib/env"

Network.setIpfsGateway(IPFS_GATEWAY)

const indexer = new Indexer()

let contract: Contract

const useContract = () => {
  const { connector, isConnected } = useAccount()
  if (isConnected && connector) {
    connector?.getProvider().then(async (provider) => {
      contract = new Contract(provider)
      await contract.connect()
    })
  } else {
    contract = new Contract()
    contract.connect()
  }
  return contract
}

export { indexer, useContract }
