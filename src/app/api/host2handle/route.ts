import { OUR_DOMAIN } from "~/lib/env"
import { cacheGet } from "~/lib/redis.server"
import { getQuery, NextServerResponse } from "~/lib/server-helper"
import { checkDomainServer, fetchTenant } from "~/models/site.model"

// /api/host2handle?host=blog.innei.ren
export async function GET(req: Request) {
  let { host } = getQuery(req)

  let realHost: string
  if (Array.isArray(host)) {
    realHost = host[0]
  } else {
    realHost = host || ""
  }
  let result = {}

  const OUR_DOMAIN_SUFFIX = `.${OUR_DOMAIN}`
  if (realHost && realHost !== OUR_DOMAIN) {
    result = await cacheGet({
      key: ["host2handle", realHost],
      getValueFun: async () => {
        if (realHost.endsWith(OUR_DOMAIN_SUFFIX)) {
          const subdomain = realHost.replace(OUR_DOMAIN_SUFFIX, "")
          const ip = req.headers.get("x-xlog-ip")
          const res = await fetch(
            `https://indexer.crossbell.io/v1/handles/${subdomain}/character`,
            ip
              ? {
                  headers: {
                    "x-forwarded-for": ip,
                  },
                }
              : undefined,
          )
          const char = await res.json()
          const customDomain =
            char?.metadata?.content?.attributes?.find(
              (a: any) => a.trait_type === "xlog_custom_domain",
            )?.value || ""
          if (
            customDomain &&
            (await checkDomainServer(customDomain, subdomain))
          ) {
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
          const tenant = await fetchTenant(realHost, 5)
          if (tenant) {
            return {
              subdomain: tenant,
            }
          }
        }
      },
    })
  }
  const res = new NextServerResponse()
  return res.status(200).json(result)
}
