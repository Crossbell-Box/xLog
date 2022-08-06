import { Contract, Indexer } from "crossbell.js"

const indexer = new Indexer()
const contract =
  typeof window !== "undefined"
    ? new Contract((<any>window).ethereum)
    : undefined
if (contract) {
  contract.connect()
}

export { indexer, contract }
