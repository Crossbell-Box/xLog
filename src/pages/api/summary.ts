import { NextApiRequest, NextApiResponse } from "next"

import { OpenAI } from "langchain"
import { loadSummarizationChain } from "langchain/chains"
import { PromptTemplate } from "langchain/prompts"
import { AnalyzeDocumentChain } from "langchain/chains"

import { toGateway } from "~/lib/ipfs-parser"
import prisma from "~/lib/prisma.server"
import { Metadata } from "@prisma/client"
import { cacheGet } from "~/lib/redis.server"

const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  temperature: 0.3,
  maxTokens: 400,
})

const chains = new Map<string, AnalyzeDocumentChain>()

const getOriginalSummary = async (cid: string, lang: string) => {
  try {
    console.log("fetching summary", cid, lang)

    const { content } = await (await fetch(toGateway(`ipfs://${cid}`))).json()

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
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export async function getSummary(cid: string, lang: string = "en") {
  const summary = await cacheGet({
    key: ["summary", cid, lang],
    getValueFun: async () => {
      if (["en", "zh", "zh-TW", "ja"].includes(lang)) {
        const key = `ai_summary_${lang.replace("-", "").toLowerCase()}`
        const meta = await prisma.metadata.findFirst({
          where: {
            uri: `ipfs://${cid}`,
          },
        })
        if (meta) {
          if (meta?.[key as keyof Metadata]) {
            return meta?.[key as keyof Metadata]
          } else {
            const summary = await getOriginalSummary(cid, lang)
            if (summary) {
              await prisma.metadata.update({
                where: {
                  uri: `ipfs://${cid}`,
                },
                data: {
                  [key as keyof Metadata]: summary,
                },
              })

              return summary
            }
          }
        } else {
          const summary = await getOriginalSummary(cid, lang)
          if (summary) {
            await prisma.metadata.create({
              data: {
                uri: `ipfs://${cid}`,
                [key as keyof Metadata]: summary,
              },
            })

            return summary
          }
        }
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

  res.status(200).json({
    data: await getSummary(cid as string, lang as string),
  })
}
