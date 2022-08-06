import { QueryClient } from "@tanstack/react-query"
import { createRedisPersister } from "~/lib/persister.server"
import { persistQueryClient } from "@tanstack/react-query-persist-client"

const cacheTime = 30 * 60 * 60 * 1000 // 30 days

const persister = createRedisPersister()

const queryClientServerIn = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime,
    },
  },
})

if (persister) {
  persistQueryClient({
    queryClient: queryClientServerIn,
    persister,
    maxAge: cacheTime,
  })
}

export const queryClientServer = queryClientServerIn
