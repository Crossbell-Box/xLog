import * as trpc from "@trpc/server"
import { IncomingMessage } from "http"
import { AuthUser, getAuthUser } from "./auth.server"
import { createGate, Gate } from "./gate.server"

export type TRPCContext = { user: AuthUser | null | undefined; gate: Gate }

export const getTRPCContext = async ({
  req,
}: {
  req: IncomingMessage
}): Promise<TRPCContext> => {
  const user = await getAuthUser(req)
  const gate = createGate({ user })
  return {
    user,
    gate,
  }
}

export const createRouter = () => {
  return trpc.router<TRPCContext>()
}
