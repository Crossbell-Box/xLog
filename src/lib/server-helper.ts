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

    const contentType = "application/json"

    return new Response(nextData, { headers: { contentType } })
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
}
