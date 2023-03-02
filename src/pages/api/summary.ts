import { NextApiRequest, NextApiResponse } from "next"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import { cacheGet } from "~/lib/redis.server"
import { toGateway } from "~/lib/ipfs-parser"

const returnLimit = 400
const chunkSize = 4000

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize,
  chunkOverlap: 1,
})

async function segmentedSummary(
  content: string,
  lang: string,
): Promise<string> {
  const segments = await splitter.createDocuments([content])

  const results: string[] = await Promise.all(
    segments.map(async (segment) => {
      const prompt = `Summarize this in ${lang} language in less than ${returnLimit} characters: ${segment.pageContent}`

      const response = await (
        await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo-0301",
            temperature: 0,
            top_p: 1,
            frequency_penalty: 1,
            presence_penalty: 1,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        })
      ).json()

      return response.choices?.[0]?.message?.content?.trim()
    }),
  )

  if (results.length > 1) {
    return segmentedSummary(results.join("\n"), lang)
  } else {
    return results[0]
  }
}

export async function getSummary(cid: string, lang: string = "en") {
  const summary = await cacheGet({
    key: ["summary", cid, lang],
    getValueFun: async () => {
      try {
        console.log("fetching summary", cid, lang)

        const { content } = await (
          await fetch(toGateway(`ipfs://${cid}`))
        ).json()

        const result = await segmentedSummary(content, lang)

        return result
      } catch (error) {
        console.error(error)
        return undefined
      }
    },
    noUpdate: true,
  })

  return summary
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let { cid, lang } = req.query

  if (!cid) {
    res.status(400).send("Bad Request")
    return
  }

  res.status(200).send(await getSummary(cid as string, lang as string))
}
