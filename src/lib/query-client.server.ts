import { QueryClient } from '@tanstack/react-query'

const cacheTime = parseInt(process.env.CACHE_MAX_AGE || "600000")

const queryClientServerIn = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime,
    },
  },
})

export const queryClientServer = queryClientServerIn
