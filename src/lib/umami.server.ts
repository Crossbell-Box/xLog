import { OUR_DOMAIN } from "./env"
import { UMAMI_ENDPOINT, UMAMI_TOKEN } from "./env.server"
import { singleton } from "./singleton.server"

class Umami {
  constructor() {}

  async request(
    url: string,
    options: {
      method: "GET" | "POST"
      query?: Record<string, any>
      data?: Record<string, any>
    },
  ) {
    if (options.query) {
      url += `?${new URLSearchParams(options.query).toString()}`
    }
    const body = options.data ? JSON.stringify(options.data) : undefined
    return fetch(`https://${UMAMI_ENDPOINT}/api${url}`, {
      method: options.method,
      body,
      headers: {
        Authorization: `Bearer ${UMAMI_TOKEN}`,
        Accept: "application/json",
      },
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`)
      }
      return res.json()
    })
  }

  async createAnalytics(site: { id: string; name: string }) {
    const { website_uuid } = await this.request(`/website`, {
      method: "POST",
      data: {
        domain: `${site.id}.${OUR_DOMAIN}`,
        name: site.name,
        enable_share_url: false,
        public: false,
      },
    })

    return website_uuid
  }
}

export const umami = singleton("umami", () => new Umami())
