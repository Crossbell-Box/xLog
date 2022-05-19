import { z } from "zod"
import { createRouter } from "~/lib/trpc.server"
import { createOrUpdatePage, deletePage } from "~/models/page.model"

export const pageRouter = createRouter()
  .query("authors", {
    resolve() {},
  })
  .mutation("createOrUpdate", {
    input: z.object({
      siteId: z.string(),
      pageId: z.string().optional(),
      title: z.string().optional(),
      content: z.string().optional(),
      published: z.boolean().optional(),
      publishedAt: z.string().optional(),
      excerpt: z.string().optional(),
      isPost: z.boolean(),
      slug: z.string().optional(),
    }),
    output: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const { page } = await createOrUpdatePage(ctx.gate, input)
      return page
    },
  })
  .mutation("delete", {
    input: z.object({
      pageId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await deletePage(ctx.gate, { id: input.pageId })
    },
  })
