import { decrypt, getDerivedKey } from "@proselog/jwt"

const randomId = () => crypto.randomUUID()

const getExtension = (path: string) => {
  const lastPart = path.split(".").pop()
  return lastPart ? `.${lastPart}` : ""
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*",
}

const send = (data: string | Record<string, string>, init?: ResponseInit) => {
  const isJSON = data && typeof data === "object"
  return new Response(isJSON ? JSON.stringify(data) : data, {
    ...init,
    headers: {
      ...init?.headers,
      ...corsHeaders,
      "content-type": isJSON ? "application/json" : "text/plain",
    },
  })
}

const handler: ExportedHandler<{ BUCKET: R2Bucket; ENCRYPT_SECRET: string }> = {
  async fetch(request, env, event): Promise<Response> {
    try {
      // Files are publicly accessible
      if (request.method === "GET") {
        const cache = caches.default

        const url = new URL(request.url)

        if (url.pathname === "/") {
          return send("hello world")
        }

        const key = url.pathname.substring(1)

        const cachedResponse = await cache.match(request)

        if (cachedResponse) {
          console.log("cached!")
          return cachedResponse
        }

        const object = await env.BUCKET.get(key)
        if (!object) {
          return send("object not found", { status: 404 })
        }
        const response = new Response(object.body, {
          headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        })
        event.waitUntil(cache.put(request, response.clone()))
        return response
      }

      if (request.method === "OPTIONS") {
        return send("")
      }

      if (request.method === "POST") {
        const token = request.headers
          .get("authorization")
          ?.replace("Bearer ", "")

        if (!token) {
          throw new Error("missing auth token")
        }

        let uid: string | undefined
        if (env.ENCRYPT_SECRET && token) {
          const key = await getDerivedKey(env.ENCRYPT_SECRET)
          try {
            const payload = await decrypt(token, key)
            uid = payload.uid as string
          } catch (error) {
            console.error({ error })
            return send("invalid token", {
              status: 401,
            })
          }
        }

        if (!uid) {
          throw new Error("failed to extract uid")
        }

        const data = await request.formData()
        const id = randomId()
        const file = data.get("file") as File

        if (!file || !(file instanceof File)) {
          throw new Error("missing file or invalid file")
        }

        const key = `${uid}/${id}${getExtension(file.name)}`

        await env.BUCKET.put(key, await file.arrayBuffer(), {
          httpMetadata: {
            contentType: file.type,
          },
          customMetadata: {
            // Store the original filename
            filename: file.name,
          },
        })

        return send({ key })
      }
    } catch (error: any) {
      console.error({ error })
      return send(error.message, { status: 500 })
    }

    return send("Hello World!")
  },
}

export default handler
