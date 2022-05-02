import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { type LoaderFunction } from "@remix-run/node"
import { siteController } from "~/controllers/site.controller"
import { AvatarForm } from "~/components/dashboard/AvatarForm"
import { useEffect } from "react"
import toast from "react-hot-toast"

export const loader: LoaderFunction = async ({ request, params }) => {
  const subdomain = params.subdomain as string
  const { site } = await siteController.getSite(subdomain)
  return {
    site,
  }
}

export default function SiteSettingsGeneralPage() {
  const loaderData = useLoaderData()
  const site = loaderData.site
  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.type === "done") {
      toast.success("Updated!")
    }
  }, [fetcher.type])

  return (
    <>
      <div>
        <label className="label">Icon</label>
        <AvatarForm site={site.id} name={site.name} filename={site.icon} />
      </div>
      <fetcher.Form method="post" action={`/api/sites/${site.id}`}>
        <div className="mt-5">
          <Input
            required
            label="Name"
            id="name"
            name="name"
            defaultValue={site.name}
          />
        </div>
        <div className="mt-5">
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            className="input is-block"
            name="description"
            defaultValue={site.description}
            rows={6}
          />
        </div>
        <div className="mt-5">
          <Button type="submit" isLoading={fetcher.state === "submitting"}>
            Save
          </Button>
        </div>
      </fetcher.Form>
      {/* <div className="mt-14 border-t pt-8">
        <h3 className="text-red-500 text-lg mb-5">Danger Zone</h3>
        <form>
          <Button variantColor="red" type="submit">
            Delete Site
          </Button>
        </form>
      </div> */}
    </>
  )
}
