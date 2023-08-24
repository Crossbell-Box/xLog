import { createClient, fetchExchange } from "@urql/core"

import { API_URL } from "~/lib/env"

export const client = createClient({
  url: `${API_URL}/graphql`,
  exchanges: [fetchExchange],
})
