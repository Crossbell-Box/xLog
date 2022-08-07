import { Contract, Indexer } from "crossbell.js"

const indexer = new Indexer()

let contract: Contract | undefined

const getContract = () => {
  if (!contract && typeof window !== "undefined") {
    contract = new Contract((<any>window).ethereum)
    contract.connect()
  }
  return contract
}

export { indexer, getContract }
