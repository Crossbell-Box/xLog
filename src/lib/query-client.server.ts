import { QueryClient } from '@tanstack/react-query'

const queryClientServerIn = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 30 * 60 * 60 * 1000,
    },
  },
})

export const queryClientServer = queryClientServerIn
