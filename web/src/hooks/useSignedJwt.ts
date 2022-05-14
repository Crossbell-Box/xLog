import { trpc } from "~/lib/trpc"

export const useSignedJwt = () => {
  const jwt = trpc.useQuery(["user.getSignedJwt"], {
    refetchInterval: 60_000,
  })
  return jwt.data
}
