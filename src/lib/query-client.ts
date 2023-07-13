import { cache } from "react"

import { QueryClient } from "@tanstack/react-query"

const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 1000,
          cacheTime: 60 * 1000,
        },
      },
    }),
)

export default getQueryClient
