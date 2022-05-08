import { z } from "zod"
import { siteController } from "~/controllers/site.controller"
import { createRouter } from "~/lib/trpc.server"

export const dashboardRouter = createRouter().query("sitesForSwitcher", {
  output: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      subdomain: z.string(),
      createdAt: z.date().transform((v) => v.toISOString()),
      icon: z.string().nullable(),
    })
  ),
  async resolve({ ctx }) {
    const sites = await siteController.getSites(ctx.gate)
    return sites
  },
})
