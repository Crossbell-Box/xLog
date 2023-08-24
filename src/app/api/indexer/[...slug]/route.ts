import { NextServerResponse } from "~/lib/server-helper"

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: {
      slug: string[]
    }
  },
) {
  const searchParams = new URL(req.url).searchParams
  const result = await (
    await fetch(
      `https://indexer.crossbell.io/v1/${params.slug.join("/")}${
        searchParams ? `?${searchParams}` : ""
      }`,
    )
  ).json()

  const res = new NextServerResponse()
  return res.status(200).json(result)
}

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: {
      slug: string[]
    }
  },
) {
  const searchParams = new URL(req.url).searchParams
  const result = await (
    await fetch(
      `https://indexer.crossbell.io/v1/${params.slug.join("/")}${
        searchParams ? `?${searchParams}` : ""
      }`,
      {
        method: "POST",
        body: await req.text(),
        headers: {
          "content-type": "application/json",
        },
      },
    )
  ).json()

  const res = new NextServerResponse()
  return res.status(200).json(result)
}
