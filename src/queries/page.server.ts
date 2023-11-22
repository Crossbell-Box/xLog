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

import { getTranslation as getTranslationWithI18n } from "~/lib/i18n"
import { languageNames } from "~/lib/i18n/settings"
import { toCid, toGateway } from "~/lib/ipfs-parser"
import { llmModelSwitcherByTextLength } from "~/lib/llm-model-switcher-by-text-length"
import prisma from "~/lib/prisma.server"
import { cacheGet } from "~/lib/redis.server"
import { Language } from "~/lib/types"
import * as pageModel from "~/models/page.model"

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
  title?: string
  content?: string
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

type ChainKeyType = `${4 | 16}k_${Language}` // e.g. "4k_en" | "4k_zh" | "4k_zh-TW" | "4k_ja" | "16k_en" | "16k_zh" | "16k_zh-TW" | "16k_ja"
const translationChains = new Map<ChainKeyType, LLMChain>()

const getOriginalTranslation = async (
  cid: string,
  targetLang: Language,
  originalLang?: Language,
): Promise<ContentTranslation | undefined> => {
  if (!translationModel4K || !translationModel16K) return

  try {
    const { title, content } = await (
      await fetch(toGateway(`ipfs://${cid}`))
    ).json()

    // If the detected language is the same as the target language, return the original content
    if (originalLang === targetLang) {
      console.warn(
        `|__ Warn: Detected language is the same as the target language, return the original content: ${cid}, ${targetLang}`,
      )
      return
    }

    console.time(`fetching translation ${cid}, ${targetLang}`)
    const { modelSize, tokens } = llmModelSwitcherByTextLength(content, {
      includeResponse: { lang: targetLang },
    })

    if (!modelSize) {
      console.error(
        `|__ Error: Content too long for translation: ${cid}, ${targetLang}. (Tokens: ${tokens})`,
      )
      return
    }

    let chain = translationChains.get(`${modelSize}_${targetLang}`)

    if (!chain) {
      const prompt = new PromptTemplate({
        template: `Translate the following text into "${languageNames[targetLang]}" language: 
        {text}
        Translation:`,
        inputVariables: ["text"],
      })

      const translateModel =
        modelSize === "4k" ? translationModel4K : translationModel16K

      chain = new LLMChain({ llm: translateModel, prompt })

      translationChains.set(`${modelSize}_${targetLang}`, chain)
    }

    const t = await chain.call({ text: title })
    const c = await chain.call({ text: content })

    console.timeEnd(`fetching translation ${cid}, ${targetLang}`)

    return {
      title: t.text,
      content: c.text,
    }
  } catch (error) {
    console.error(error)
    console.timeEnd(`fetching translation ${cid}, ${targetLang}`)
  }
}

async function getTranslation({
  cid,
  lang = "en",
}: {
  cid: string
  lang?: Language
}) {
  const translatedContent = (await cacheGet({
    key: ["translation", cid, lang],
    allowEmpty: true,
    noUpdate: true,
    noExpire: true,
    getValueFun: async () => {
      let result

      await lock.acquire(`translation_${cid}`, async () => {
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

// Modify page content with translation
export async function decoratePageWithTranslation(
  page?: Awaited<ReturnType<typeof pageModel.getPage>> | null,
) {
  if (!page) return
  const cid = toCid(page?.metadata?.uri || "")
  const { i18n } = await getTranslationWithI18n()
  const targetLanguage = i18n.resolvedLanguage as Language
  const originalLanguage = page?.metadata?.content?.originalLanguage

  if (originalLanguage === targetLanguage) {
    return
  }

  const translatedContent = await getTranslation({
    cid,
    lang: targetLanguage,
  })

  if (translatedContent && page?.metadata?.content) {
    page.metadata.content["content"] = translatedContent.content
    page.metadata.content["title"] = translatedContent.title
  }
}

// Post summary

let model: OpenAI | undefined
if (process.env.OPENAI_API_KEY) {
  model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo",
    temperature: 0.3,
    maxTokens: 400,
  })
}
const chains = new Map<string, AnalyzeDocumentChain>()

const getOriginalSummary = async (cid: string, lang: string) => {
  if (!model) return
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

        const combineDocsChain = loadSummarizationChain(model, {
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

const lock = new AsyncLock()

export async function getSummary({
  cid,
  lang = "en",
}: {
  cid: string
  lang?: string
}) {
  const summary = (await cacheGet({
    key: ["summary", cid, lang],
    allowEmpty: true,
    noUpdate: true,
    noExpire: true,
    getValueFun: async () => {
      if (["en", "zh", "zh-TW", "ja"].includes(lang)) {
        let result
        await lock.acquire(cid, async () => {
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
