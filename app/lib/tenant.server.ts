import { OUR_DOMAIN } from "./config.shared"

export const getTenant = (request: Request) => {
  const host = request.headers.get("host")

  const OUR_DOMAIN_SUFFIX = `.${OUR_DOMAIN}`
  if (host) {
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
