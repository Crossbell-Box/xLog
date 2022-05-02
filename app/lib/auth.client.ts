export const logout = () => {
  const url = new URL(`${location.protocol}//${ENV.OUR_DOMAIN}/api/logout`)
  if (location.host !== ENV.OUR_DOMAIN) {
    url.searchParams.set(
      "next",
      `${location.protocol}//${location.host}/api/logout`
    )
  }
  location.href = url.href
}
