import AsyncLock from "async-lock"
import { AnalyzeDocumentChain, loadSummarizationChain } from "langchain/chains"
import { OpenAI } from "langchain/llms/openai"
import { PromptTemplate } from "langchain/prompts"
import { headers } from "next/headers"
import removeMarkdown from "remove-markdown"

import { Metadata } from "@prisma/client"
import { QueryClient } from "@tanstack/react-query"

import { getNoteSlug } from "~/lib/helpers"
import { toGateway } from "~/lib/ipfs-parser"
import prisma from "~/lib/prisma.server"
import { cacheDelete, cacheGet } from "~/lib/redis.server"
import * as pageModel from "~/models/page.model"
import { client } from "~/queries/graphql"

export async function getIdBySlug(slug: string, characterId: string | number) {
  slug = (slug as string)?.toLowerCase?.()

  const ip = headers().get("x-xlog-ip")
  const result = (await cacheGet({
    key: ["slug2id", characterId, slug],
    getValueFun: async () => {
      let note
      let cursor = ""

      do {
        const response = await (
          await fetch(
            `https://indexer.crossbell.io/v1/notes?characterId=${characterId}&sources=xlog&cursor=${cursor}&limit=100`,
            ip
              ? {
                  headers: {
                    "x-forwarded-for": ip,
                  },
                }
              : undefined,
          )
        ).json()
        cursor = response.cursor
        note = response?.list?.find(
          (item: any) =>
            slug === getNoteSlug(item) ||
            slug === `${characterId}-${item.noteId}`,
        )
      } while (!note && cursor)

      return {
        noteId: note?.noteId,
      }
    },
    // noUpdate: true,
  })) as {
    noteId: number
  }

  // revalidate
  if (result) {
    const noteIdMatch = slug.match(`^${characterId}-(\\d+)$`)
    if (!noteIdMatch?.[1]) {
      client
        .query(
          `query getNote {
        note(
          where: {
            note_characterId_noteId_unique: {
              characterId: ${characterId},
              noteId: ${result.noteId},
            },
          },
        ) {
          characterId
          noteId
          deleted
          metadata {
            content
          }
        }
      }`,
          {},
        )
        .then((result: any) => {
          const note = result.data?.note
          if ((note && getNoteSlug(note) !== slug) || note?.deleted) {
            cacheDelete(["slug2id", characterId + "", slug])
          }
        })
    }
  }

  return result
}

export const fetchGetPage = async (
  input: Partial<Parameters<typeof pageModel.getPage>[0]>,
  queryClient: QueryClient,
) => {
  const key = ["getPage", input.characterId, input]
  return await queryClient.fetchQuery(key, async () => {
    if (!input.characterId || !input.slug) {
      return null
    }
    if (!input.noteId) {
      const slug2Id = await getIdBySlug(input.slug, input.characterId)
      if (!slug2Id?.noteId) {
        return null
      }
      input.noteId = slug2Id.noteId
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
        input_document: removeMarkdown(content, {
          useImgAltText: true,
          gfm: true,
        }),
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
