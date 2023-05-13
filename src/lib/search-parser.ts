import { headers } from "next/headers"

export const searchParser = () => {
  const search = headers().get("x-search")

  return new URLSearchParams(search?.substring(1) || "")
}

export const isOnlyContent = () => {
  return searchParser().get("only-content")
}
