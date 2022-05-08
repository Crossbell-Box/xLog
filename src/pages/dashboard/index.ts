import { getAuthUser } from "~/lib/auth.server"
import { redirect, serverSidePropsHandler } from "~/lib/server-side-props"
import { getUserLastActiveSite } from "~/models/site.model"

export const getServerSideProps = serverSidePropsHandler(async (ctx) => {
  const user = await getAuthUser(ctx.req)

  if (!user) {
    return redirect("/")
  }
  const site = await getUserLastActiveSite(user.id)
  if (!site) {
    return redirect(`/dashboard/new-site`)
  }
  return redirect(`/dashboard/${site.subdomain}`)
})

export default () => null
