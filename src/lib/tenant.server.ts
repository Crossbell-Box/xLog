import { OUR_DOMAIN } from "./env"

export const getTenant = async (request: Request, search: URLSearchParams) => {
  const host = request.headers.get("host")

  if (!OUR_DOMAIN) {
    throw new Error("missing OUR_DOMAIN env")
  }

  const OUR_DOMAIN_SUFFIX = `.${OUR_DOMAIN}`
  if (host && host !== OUR_DOMAIN) {
    if (host.endsWith(OUR_DOMAIN_SUFFIX)) {
      const subdomain = host.replace(OUR_DOMAIN_SUFFIX, "")
      const res = await fetch(
        `https://indexer.crossbell.io/v1/handles/${subdomain}/character`,
      )
      const char = await res.json()
      const customDomain =
        char?.metadata?.content?.attributes?.find(
          (a: any) => a.trait_type === "xlog_custom_domain",
        )?.value || ""
      if (customDomain) {
        return {
          redirect: /^https?:\/\//.test(customDomain)
            ? customDomain
            : `https://${customDomain}`,
          subdomain: subdomain,
        }
      } else {
        return {
          subdomain: subdomain,
        }
      }
    } else {
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
        const res = await fetch(
          `https://indexer.crossbell.io/v1/handles/${tenant}/character`,
        )
        const char = await res.json()
        const customDomain =
          char?.metadata?.content?.attributes?.find(
            (a: any) => a.trait_type === "xlog_custom_domain",
          )?.value || ""
        if (customDomain && customDomain === host) {
          return {
            subdomain: tenant,
          }
        }
      }
    }
  }
  return
}
