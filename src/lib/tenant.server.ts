import { OUR_DOMAIN } from "./env"

export const getTenant = (request: Request, search: URLSearchParams) => {
  const host = request.headers.get("host")

  if (!OUR_DOMAIN) {
    throw new Error("missing OUR_DOMAIN env")
  }

  if (search.has("tenant")) {
    return search.get("tenant")
  }

  const OUR_DOMAIN_SUFFIX = `.${OUR_DOMAIN}`
  if (host) {
    if (host.endsWith(".fly.dev")) {
      return
    }
    if (host.endsWith(OUR_DOMAIN_SUFFIX)) {
      const subdomain = host.replace(OUR_DOMAIN_SUFFIX, "")
      return subdomain
    }
    if (host !== OUR_DOMAIN) {
      return host
    }
  }
  return
}
