import { createClient, fetchExchange } from "@urql/core"

export const client = createClient({
  url: "https://indexer.crossbell.io/v1/graphql",
  exchanges: [fetchExchange],
})
