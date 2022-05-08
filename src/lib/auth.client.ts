import { OUR_DOMAIN } from "./env"

export const logout = () => {
  const url = new URL(`${location.protocol}//${OUR_DOMAIN}/api/logout`)
  if (location.host !== OUR_DOMAIN) {
    url.searchParams.set(
      "next",
      `${location.protocol}//${location.host}/api/logout`
    )
  }
  location.href = url.href
}
