import { type LoaderFunction, redirect } from "@remix-run/node"
import { getAuthUser } from "~/lib/auth.server"
import { getUserLastActiveSite } from "~/models/site.model"

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getAuthUser(request)

  if (!user) {
    return redirect("/")
  }
  const site = await getUserLastActiveSite(user.id)
  if (!site) {
    return redirect(`/dashboard/new-site`)
  }
  return redirect(`/dashboard/${site.subdomain}`)
}
