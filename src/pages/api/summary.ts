import { NextApiRequest, NextApiResponse } from "next"

import { OpenAI } from "langchain"
import { loadSummarizationChain } from "langchain/chains"
import { PromptTemplate } from "langchain/prompts"
import { AnalyzeDocumentChain } from "langchain/chains"

import { cacheGet } from "~/lib/redis.server"
import { toGateway } from "~/lib/ipfs-parser"

const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  temperature: 0.3,
  maxTokens: 400,
})

const chains = new Map<string, AnalyzeDocumentChain>()

async function segmentedSummary(
  content: string,
  lang: string,
): Promise<string> {
  let chain = chains.get(lang)
  if (!chain) {
    const prompt = new PromptTemplate({
      template: `Summarize this in ${lang} language:
    "{text}"
    CONCISE SUMMARY:`,
      inputVariables: ["text"],
    })

    const combineDocsChain = loadSummarizationChain(model, {
      prompt,
      combineMapPrompt: prompt,
      combinePrompt: prompt,
    })

    chain = new AnalyzeDocumentChain({
      combineDocumentsChain: combineDocsChain,
    })

    chains.set(lang, chain)
  }

  const res = await chain.call({
    input_document: content,
  })

  return res?.text
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
