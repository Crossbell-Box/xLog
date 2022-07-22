import { QueryClient } from '@tanstack/react-query'

const queryClientServerIn = new QueryClient()

export const cacheMaxAge = parseInt(process.env.CACHE_MAX_AGE || "600000")

export const queryClientServer = queryClientServerIn
