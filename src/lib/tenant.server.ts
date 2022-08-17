import { OUR_DOMAIN } from "./env"
import { getSite } from "~/models/site.model"

export const getTenant = async (request: Request, search: URLSearchParams) => {
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
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=_xlog-challenge.${host}&type=TXT`,
        {
          headers: {
            accept: "application/dns-json",
          },
        },
      )
      const txt = await res.json()
      const tenant = txt?.Answer?.[0]?.data.replace(/^"|"$/g, "")
      if (tenant) {
        const site = await getSite(tenant)
        if (site.custom_domain === host) {
          return tenant
        }
      }
    }
  }
  return
}
