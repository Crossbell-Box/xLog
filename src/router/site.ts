import { z } from "zod"
import { createRouter } from "~/lib/trpc.server"
import { PageVisibilityEnum } from "~/lib/types"
import {
  getSite,
  getSubscription,
  updateSite,
  createSite,
  subscribeToSite,
  unsubscribeFromSite,
} from "~/models/site.model"
import {
  getPage,
  getPagesBySite,
  scheduleEmailForPost,
} from "~/models/page.model"

export const siteRouter = createRouter()
  .query("subscription", {
    input: z.object({
      site: z.string(),
    }),
    output: z
      .object({
        email: z.boolean().optional(),
      })
      .nullable(),
    async resolve({ input, ctx }) {
      const user = ctx.gate.getUser()
      if (!user) return null
      const site = await getSite(input.site)
      const subscription = await getSubscription({
        siteId: site.id,
        userId: user.id,
      })
      return subscription ? subscription.config : null
    },
  })
  .query("pages", {
    input: z.object({
      site: z.string(),
      type: z.enum(["post", "page"]).default("post"),
      visibility: z
        .enum([
          PageVisibilityEnum.All,
          PageVisibilityEnum.Published,
          PageVisibilityEnum.Draft,
          PageVisibilityEnum.Scheduled,
        ])
        .nullish(),
      take: z.number().optional(),
      cursor: z.string().optional(),
      includeContent: z.boolean().optional(),
      includeExcerpt: z.boolean().optional(),
    }),
    output: z.object({
      list: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          body: z.object({
            content: z.string(),
          }),
          date_published: z.date().transform((v) => v.toISOString()),
          summary: z.object({
            content: z.string(),
          }),
        }),
      ),
      total: z.number(),
      hasMore: z.boolean(),
    }),
    async resolve({ input, ctx }) {
      const result = await getPagesBySite(input)
      return result
    },
  })
  .query("page", {
    input: z.object({
      site: z.string(),
      page: z.string(),
      render: z.boolean(),
      includeAuthors: z.boolean().optional(),
    }),
    output: z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      excerpt: z.string().nullable(),
      published: z.boolean(),
      publishedAt: z.date().transform((v) => v.toISOString()),
      slug: z.string(),
      type: z.enum(["PAGE", "POST"]),
      rendered: z
        .object({
          excerpt: z.string(),
          contentHTML: z.string(),
        })
        .nullable(),
      authors: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            avatar: z.string().nullable(),
          }),
        )
        .optional(),
      emailSubject: z.string().nullish(),
      emailStatus: z.string().nullish(),
      siteId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const page = await getPage(ctx.gate, input)
      return page
    },
  })
  .mutation("updateSite", {
    input: z.object({
      site: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      icon: z.string().nullish(),
      subdomain: z.string().optional(),
      navigation: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            url: z
              .string()
              .regex(
                /^(https?:\/\/|\/)/,
                "URL must start with / or http:// or https://",
              ),
          }),
        )
        .optional(),
    }),
    output: z.object({
      site: z.object({
        id: z.string(),
        name: z.string(),
        subdomain: z.string(),
      }),
      subdomainUpdated: z.boolean(),
    }),
    async resolve({ ctx, input }) {
      const { site, subdomainUpdated } = await updateSite(ctx.gate, input)
      return {
        site,
        subdomainUpdated,
      }
    },
  })

  .mutation("create", {
    input: z.object({
      name: z.string(),
      subdomain: z.string().min(3).max(26),
    }),
    output: z.object({
      id: z.string(),
      subdomain: z.string(),
    }),
    async resolve({ input, ctx }) {
      const { site } = await createSite(ctx.gate, input)
      return site
    },
  })
  .mutation("subscribe", {
    input: z.object({
      email: z.boolean().optional(),
      siteId: z.string(),
      newUser: z
        .object({
          email: z.string(),
          url: z.string(),
        })
        .optional(),
    }),
    async resolve({ input, ctx }) {
      await subscribeToSite(ctx.gate, input)
    },
  })
  .mutation("unsubscribe", {
    input: z.object({
      siteId: z.string(),
    }),
    async resolve({ input, ctx }) {
      await unsubscribeFromSite(ctx.gate, input)
    },
  })
  .mutation("scheduleEmailForPost", {
    input: z.object({
      pageId: z.string(),
      emailSubject: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      await scheduleEmailForPost(ctx.gate, {
        pageId: input.pageId,
        emailSubject: input.emailSubject,
      })
    },
  })
