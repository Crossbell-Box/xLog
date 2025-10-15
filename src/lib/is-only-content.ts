import { headers } from "next/headers"

export const searchParser = async () => {
  const search = (await headers()).get("x-xlog-search")

  return new URLSearchParams(search?.substring(1) || "")
}

export const isOnlyContent = async () => {
  return !!(await searchParser()).get("only-content")
}
