import { isServerSide } from "./utils"

export const searchParser = async () => {
  let search
  if (isServerSide()) {
    const { headers } = await import("next/headers")
    search = headers().get("x-xlog-search")
  } else {
    search = window.location.search
  }

  return new URLSearchParams(search?.substring(1) || "")
}

export const isOnlyContent = async () => {
  return (await searchParser()).get("only-content")
}
