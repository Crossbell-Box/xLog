import { createReactQueryHooks } from "@trpc/react"
import { withTRPC } from "@trpc/next"
import type { AppRouter } from "~/router"

export const trpc = createReactQueryHooks<AppRouter>()

export const wrapTrpc = ({ ssr }: { ssr?: boolean } = {}) => {
  return withTRPC({
    config() {
      const url = "/api/trpc"

      return {
        url,
        fetch(url, init) {
          return fetch(url, {
            ...init,
            credentials: "same-origin",
          })
        },
      }
    },
    ssr,
  })
}
