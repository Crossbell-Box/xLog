import { NoteEntity } from "crossbell"
import { nanoid } from "nanoid"
import { zeroAddress } from "viem"

import { EditorValues, ExpandedNote } from "~/lib/types"

import { RESERVED_TAGS } from "./constants"

export const editor2Crossbell = ({
  values,
  type,
  autofill,
}: {
  values: EditorValues
  type: string
  autofill?: boolean
}): NoteEntity & {
  metadata: {
    content: {
      summary?: string
    }
  }
} => {
  return {
    characterId: 0,
    noteId: 0,
    linkItemType: null,
    linkKey: "",
    toCharacterId: null,
    toAddress: null,
    toNoteId: null,
    toHeadCharacterId: null,
    toHeadNoteId: null,
    toContractAddress: null,
    toTokenId: null,
    toLinklistId: null,
    toUri: null,
    deleted: false,
    locked: false,
    contractAddress: null,
    uri: null,
    operator: zeroAddress,
    owner: zeroAddress,
    createdAt: "",
    publishedAt: "",
    updatedAt: "",
    deletedAt: null,
    transactionHash: zeroAddress,
    blockNumber: 0,
    logIndex: 0,
    updatedTransactionHash: zeroAddress,
    updatedBlockNumber: 0,
    updatedLogIndex: 0,
    metadata: {
      content: {
        title: values?.title,
        content: values?.content,
        date_published:
          values?.publishedAt ||
          (autofill ? new Date().toISOString() : undefined),
        summary: values?.excerpt,
        tags: [
          type,
          ...(values?.tags
            ?.split(",")
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag) || []),
        ],
        sources: ["xlog"],
        attributes: [
          {
            trait_type: "xlog_slug",
            value: values.slug || (autofill ? nanoid() : ""),
          },
          ...(values.disableAISummary
            ? [
                {
                  trait_type: "xlog_disable_ai_summary",
                  value: values.disableAISummary,
                },
              ]
            : []),
        ],
        external_urls: values?.externalUrl ? [values?.externalUrl] : undefined,
        attachments: [
          ...(values.cover?.address
            ? [
                {
                  name: "cover",
                  address: values.cover.address,
                  mime_type: values.cover.mime_type,
                },
              ]
            : []),
          ...(values.images?.length
            ? values.images?.map((image) => ({
                name: "image",
                address: image.address,
                mime_type: image.mime_type,
              }))
            : []),
        ],
      },
    },
  }
}

export const crossbell2Editor = (note: ExpandedNote): EditorValues => {
  return {
    title: note?.metadata?.content?.title || "",
    publishedAt: note?.metadata?.content?.date_published || "",
    published: !!note?.noteId,
    excerpt: note?.metadata?.content?.summary || "",
    slug: note?.metadata?.content?.slug || "",
    tags:
      note?.metadata?.content?.tags
        ?.filter((tag) => !RESERVED_TAGS.includes(tag))
        ?.join(", ") || "",
    content: note?.metadata?.content?.content || "",
    cover: note?.metadata?.content?.attachments?.find(
      (attachment) => attachment.name === "cover",
    ) || {
      address: "",
      mime_type: "",
    },
    disableAISummary: note?.metadata?.content?.disableAISummary || false,
    externalUrl: note?.metadata?.content?.external_urls?.[0] || "",
    images:
      note.metadata?.content?.attachments?.filter(
        (attachment) => attachment.name === "image",
      ) || [],
  }
}
