// @ts-ignore
import jsonfeedToRSS from "jsonfeed-to-rss"

export const getQuery = (req: Request) => {
  const url = new URL(req.url)
  const searchParams = url.searchParams
  const obj = {} as Record<string, any>

  for (const [key, value] of searchParams.entries()) {
    if (obj[key]) {
      if (Array.isArray(obj[key])) {
        obj[key].push(value)
      } else {
        obj[key] = [obj[key], value]
      }
    } else {
      obj[key] = value
    }
  }

  return obj
}

export class NextServerResponse {
  #status: number = 200
  #headers = new Headers()
  constructor() {}

  status(status: number) {
    this.#status = status
    return this
  }

  json(data: any) {
    const nextData = JSON.stringify(data)

    this.#headers.set("Content-Type", "application/json")

    return new Response(nextData, this.makeResponseOptions())
  }

  send(data: any) {
    // if (data instanceof Stream) {
    //   return
    // }

    if (typeof data === "object" || typeof data === "undefined") {
      return this.json(data)
    }

    return new Response(data, this.makeResponseOptions())
  }

  text(text: string) {
    return new Response(text, this.makeResponseOptions())
  }

  end() {
    return new Response("", this.makeResponseOptions())
  }

  headers(headers: Record<string, string>) {
    for (const [key, value] of Object.entries(headers)) {
      this.#headers.set(key, value)
    }

    return this
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

  private makeResponseOptions() {
    return {
      status: this.#status,
      headers: this.#headers,
    }
  }
}
