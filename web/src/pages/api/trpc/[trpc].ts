import * as trpcNext from "@trpc/server/adapters/next"
import { getTRPCContext } from "~/lib/trpc.server"

import { appRouter } from "~/router"

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: getTRPCContext,
})
