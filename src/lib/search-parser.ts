import { headers } from "next/headers"
import querystring from "querystring"

export const searchParser = <T extends Object>() => {
  const search = headers().get("x-search")
  return querystring.parse(search?.substring(1) || "") as unknown as
    | Partial<T>
    | undefined
}

export const isOnlyContent = () => {
  const parsed = searchParser<{ "only-content": boolean }>()
  return parsed?.["only-content"]
}
