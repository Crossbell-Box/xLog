import { z } from "zod"
import { createRouter } from "~/lib/trpc.server"
import { getSitesForViewer } from "~/models/site.model"

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
    const sites = await getSitesForViewer(ctx.gate)
    return sites
  },
})
