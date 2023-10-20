import AsyncLock from "async-lock"
import {
  AnalyzeDocumentChain,
  LLMChain,
  loadSummarizationChain,
} from "langchain/chains"
import { OpenAI } from "langchain/llms/openai"
import { PromptTemplate } from "langchain/prompts"
import removeMarkdown from "remove-markdown"

import { Metadata } from "@prisma/client"
import { QueryClient } from "@tanstack/react-query"

import { toGateway } from "~/lib/ipfs-parser"
import { llmModelSwitcherByTextLength } from "~/lib/llm-model-switcher-by-text-length"
import prisma from "~/lib/prisma.server"
import { cacheGet } from "~/lib/redis.server"
import * as pageModel from "~/models/page.model"

const supportedLangs = ["en", "zh", "zh-TW", "ja"] as const

export type Lang = (typeof supportedLangs)[number]

export const fetchGetPage = async (
  input: Partial<Parameters<typeof pageModel.getPage>[0]>,
  queryClient: QueryClient,
) => {
  const key = ["getPage", input.characterId, input]
  return await queryClient.fetchQuery(key, async () => {
    if (!input.characterId || !input.slug) {
      return null
    }
    return cacheGet({
      key,
      getValueFun: () =>
        pageModel.getPage({
          slug: input.slug,
          characterId: input.characterId!,
          useStat: input.useStat,
          noteId: input.noteId,
          handle: input.handle,
        }),
    }) as Promise<ReturnType<typeof pageModel.getPage>>
  })
}

export const prefetchGetPagesBySite = async (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
  queryClient: QueryClient,
) => {
  const key = ["getPagesBySite", input.characterId, input]
  await queryClient.prefetchInfiniteQuery({
    queryKey: key,
    queryFn: async ({ pageParam }) => {
      return cacheGet({
        key,
        getValueFun: () =>
          pageModel.getPagesBySite({
            ...input,
            cursor: pageParam,
          }),
      })
    },
    getNextPageParam: (lastPage) => lastPage.cursor || undefined,
  })
}

export const fetchGetPagesBySite = async (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
  queryClient: QueryClient,
) => {
  const key = ["getPagesBySite", input.characterId, input]
  return await queryClient.fetchQuery(key, async () => {
    return cacheGet({
      key,
      getValueFun: () => pageModel.getPagesBySite(input),
    }) as Promise<ReturnType<typeof pageModel.getPagesBySite>>
  })
}

// Content translation

type ContentTranslation = {
  title: string
  content: string
}

let translationModel4K: OpenAI | undefined
let translationModel16K: OpenAI | undefined
if (process.env.OPENAI_API_KEY) {
  const options = {
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.2,
    maxTokens: -1,
  }
  translationModel4K = new OpenAI({ ...options, modelName: "gpt-3.5-turbo" })
  translationModel16K = new OpenAI({
    ...options,
    modelName: "gpt-3.5-turbo-16k",
  })
}

type ChainKeyType = `${4 | 16}k_${Lang}` // "4k_en" | "4k_zh" | "4k_zh-TW" | "4k_ja" | "16k_en" | "16k_zh" | "16k_zh-TW" | "16k_ja"
const translationChains = new Map<ChainKeyType, LLMChain>()

const getOriginalTranslation = async (
  cid: string,
  lang: Lang,
): Promise<ContentTranslation | undefined> => {
  if (!translationModel4K || !translationModel16K) return

  try {
    const { title, content } = await (
      await fetch(toGateway(`ipfs://${cid}`))
    ).json()

    console.time(`fetching translation ${cid}, ${lang}`)

    const { modelSize, tokens } = llmModelSwitcherByTextLength(content, {
      includeResponse: { lang },
    })

    if (!modelSize) {
      throw new Error(
        `No model size found for ${cid}, ${lang}. (Tokens: ${tokens})`,
      )
    }

    let chain = translationChains.get(`${modelSize}_${lang}`)

    if (!chain) {
      const prompt = new PromptTemplate({
        template: `Translate this JSON into "${lang}" language as original structure: "{text}"`,
        inputVariables: ["text"],
      })

      const translateModel =
        modelSize === "4k" ? translationModel4K : translationModel16K

      chain = new LLMChain({ llm: translateModel, prompt })

      translationChains.set(`${modelSize}_${lang}`, chain)
    }

    const result = await chain.call({
      text: JSON.stringify({ title, content }),
    })

    console.timeEnd(`fetching translation ${cid}, ${lang}`)

    return JSON.parse(result.text) as ContentTranslation
  } catch (error) {
    console.error(error)
    console.timeEnd(`fetching translation ${cid}, ${lang}`)
  }
}

const translationLock = new AsyncLock()

export async function getTranslation({
  cid,
  lang = "en",
}: {
  cid: string
  lang?: Lang
}) {
  const translatedContent = (await cacheGet({
    key: ["translation", cid, lang],
    allowEmpty: true,
    noUpdate: true,
    noExpire: true,
    getValueFun: async () => {
      let result

      await translationLock.acquire(cid, async () => {
        const meta = await prisma.metadata.findFirst({
          where: {
            uri: `ipfs://${cid}`,
          },
        })

        const key = "ai_translation"
        const translations = meta?.[key as keyof Metadata] as Record<
          string,
          ContentTranslation
        >
        const translatedJson = translations?.[lang]

        if (translatedJson) {
          result = translatedJson
        } else {
          const newTranslation = await getOriginalTranslation(cid, lang)
          if (newTranslation) {
            /**
             * e.g.
             *
             * {
             *  "en": {
             *    "title": "title",
             *    "content": "content"
             *  },
             *  "zh": {
             *    "title": "标题",
             *    "content": "内容"
             *  },
             *  ...
             * }
             *
             */
            const finalTranslation = {
              ...translations,
              [lang]: newTranslation,
            }

            if (meta) {
              await prisma.metadata.update({
                where: { uri: `ipfs://${cid}` },
                data: {
                  [key as keyof Metadata]: finalTranslation,
                },
              })
            } else {
              await prisma.metadata.create({
                data: {
                  uri: `ipfs://${cid}`,
                  [key as keyof Metadata]: finalTranslation,
                },
              })
            }
            result = newTranslation
          }
        }
      })
      return result
    },
  })) as ContentTranslation | undefined

  return translatedContent
}

// Post summary

let summarizingModel: OpenAI | undefined
if (process.env.OPENAI_API_KEY) {
  summarizingModel = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo",
    temperature: 0.3,
    maxTokens: 400,
  })
}
const chains = new Map<string, AnalyzeDocumentChain>()

const getOriginalSummary = async (cid: string, lang: string) => {
  if (!summarizingModel) return
  try {
    let { content } = await (await fetch(toGateway(`ipfs://${cid}`))).json()

    if (content?.length > 5000) {
      content = content.slice(0, 5000)
    }
    if (content?.length < 200) {
      return
    } else if (content) {
      console.time(`fetching summary ${cid}, ${lang}`)

      let chain = chains.get(lang)
      if (!chain) {
        const prompt = new PromptTemplate({
          template: `Summarize this in "${lang}" language:
        "{text}"
        CONCISE SUMMARY:`,
          inputVariables: ["text"],
        })

        const combineDocsChain = loadSummarizationChain(summarizingModel, {
          type: "map_reduce",
          combineMapPrompt: prompt,
          combinePrompt: prompt,
        })

        chain = new AnalyzeDocumentChain({
          combineDocumentsChain: combineDocsChain,
        })

        chains.set(lang, chain)
      }

      const res = await chain.call({
        input_document: removeMarkdown(content),
      })

      console.timeEnd(`fetching summary ${cid}, ${lang}`)

      return res?.text as string
    }
  } catch (error) {
    console.error(error)
    console.timeEnd(`fetching summary ${cid}, ${lang}`)
  }
}

const summarizingLock = new AsyncLock()

export async function getSummary({
  cid,
  lang = "en",
}: {
  cid: string
  lang?: Lang
}) {
  const summary = (await cacheGet({
    key: ["summary", cid, lang],
    allowEmpty: true,
    noUpdate: true,
    noExpire: true,
    getValueFun: async () => {
      if (supportedLangs.includes(lang)) {
        let result
        await summarizingLock.acquire(cid, async () => {
          const meta = await prisma.metadata.findFirst({
            where: {
              uri: `ipfs://${cid}`,
            },
          })
          const key = `ai_summary_${lang.replace("-", "").toLowerCase()}`
          if (meta) {
            if (meta?.[key as keyof Metadata]) {
              result = meta?.[key as keyof Metadata]
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
                result = summary
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
              result = summary
            }
          }
        })
        return result
      }
    },
  })) as string | undefined

  return summary
}
