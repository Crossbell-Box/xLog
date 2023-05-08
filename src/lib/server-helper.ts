// @ts-ignore
import jsonfeedToRSS from "jsonfeed-to-rss"

export const getQuery = (req: Request) => {
  const url = new URL(req.url)
  const searchParams = url.searchParams
  const obj = {} as Record<string, any>

  for (const [key, value] of searchParams.entries()) {
    obj[key] = value
  }

  return obj
}

export class NextServerResponse {
  #status: number = 200
  constructor() {}

  status(status: number) {
    this.#status = status
    return this
  }

  json(data: any) {
    const nextData = JSON.stringify(data)

    return new Response(nextData, {
      status: this.#status,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  send(data: any) {
    // if (data instanceof Stream) {
    //   return
    // }

    if (typeof data === "object" || typeof data === "undefined") {
      return this.json(data)
    }

    return new Response(data, { status: this.#status })
  }

  end() {
    return new Response("", { status: this.#status })
  }

  rss(data: any, format = "json") {
    if (format === "xml") {
      return new Response(jsonfeedToRSS(data), {
        status: this.#status,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=1800",
        },
      })
    } else {
      return new Response(JSON.stringify(data), {
        status: this.#status,
        headers: {
          "Content-Type": "application/feed+json; charset=utf-8",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=1800",
        },
      })
    }
  }
}
