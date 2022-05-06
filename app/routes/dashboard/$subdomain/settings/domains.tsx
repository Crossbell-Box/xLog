import { type LoaderFunction } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { useEffect } from "react"
import toast from "react-hot-toast"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"
import { OUR_DOMAIN } from "~/lib/env"

export const loader: LoaderFunction = async ({ request, params }) => {
  await getAuthUser(request, true)
  const subdomain = params.subdomain as string
  const { site } = await siteController.getSite(subdomain)
  return {
    site: {
      id: site.id,
      name: site.name,
      subdomain: site.subdomain,
    },
  }
}

export default function SettingsDomainsPage() {
  const { site } = useLoaderData()
  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.type === "done") {
      toast.success("Saved!")
    }
  }, [fetcher.type])

  return (
    <fetcher.Form method="post" action={`/api/sites/${site.id}`}>
      <div className="">
        <Input
          name="subdomain"
          id="subdomain"
          label="Subdomain"
          addon={`.${OUR_DOMAIN}`}
          defaultValue={site.subdomain}
          className="w-28"
          error={fetcher.data?.error}
        />
      </div>
      <div className="mt-5">
        <Button type="submit" isLoading={fetcher.state === "submitting"}>
          Save
        </Button>
      </div>
    </fetcher.Form>
  )
}
