import { QueryClient } from '@tanstack/react-query'

const staleTime = parseInt(process.env.CACHE_MAX_AGE || "60 * 60 * 1000")

const queryClientServerIn = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime,
      cacheTime: staleTime * 2,
    },
  },
})

export const queryClientServer = queryClientServerIn
