import { json, redirect, type ActionFunction } from "@remix-run/node"
import { z } from "zod"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"

export const action: ActionFunction = async ({ request, params }) => {
  try {
    const user = await getAuthUser(request)
    const formData = await request.formData()
    const values = z
      .object({
        name: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().nullish().optional(),
        subdomain: z.string().optional(),
      })
      .parse(Object.fromEntries(formData))

    const { site, subdomainUpdated } = await siteController.updateSite(user, {
      site: params.site as string,
      name: values.name,
      description: values.description,
      icon: values.icon,
      subdomain: values.subdomain,
    })

    if (subdomainUpdated) {
      return redirect(`/dashboard/${site.subdomain}/settings/domains`)
    }

    return json({ site })
  } catch (error: any) {
    console.error(error)
    return { error: error.message }
  }
}
