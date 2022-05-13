import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { AvatarForm } from "~/components/dashboard/AvatarForm"
import { useEffect } from "react"
import toast from "react-hot-toast"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { trpc } from "~/lib/trpc"
import { useForm } from "react-hook-form"

export default function SiteSettingsGeneralPage() {
  const router = useRouter()

  const subdomain = router.query.subdomain as string

  const siteResult = trpc.useQuery(["site", { site: subdomain }], {
    enabled: !!subdomain,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const site = siteResult.data
  const updateSite = trpc.useMutation("site.updateSite")

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    updateSite.mutate({
      site: subdomain,
      name: values.name,
      description: values.description,
    })
  })

  useEffect(() => {
    if (site) {
      form.setValue("name", site.name)
      form.setValue("description", site.description || "")
    }
  }, [site, form])

  useEffect(() => {
    if (updateSite.isSuccess && updateSite.data) {
      toast.success("Site updated")
      updateSite.reset()
    }
  }, [updateSite])

  return (
    <DashboardLayout>
      <SettingsLayout title="Site Settings" type="site">
        {site && (
          <div>
            <label className="label">Icon</label>
            <AvatarForm
              site={site.id}
              name={site.name}
              filename={site.icon || undefined}
            />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mt-5">
            <Input required label="Name" id="name" {...form.register("name")} />
          </div>
          <div className="mt-5">
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              className="input is-block"
              rows={6}
              {...form.register("description")}
            />
          </div>
          <div className="mt-5">
            <Button type="submit" isLoading={updateSite.isLoading}>
              Save
            </Button>
          </div>
        </form>
        {/* <div className="mt-14 border-t pt-8">
        <h3 className="text-red-500 text-lg mb-5">Danger Zone</h3>
        <form>
          <Button variantColor="red" type="submit">
            Delete Site
          </Button>
        </form>
      </div> */}
      </SettingsLayout>
    </DashboardLayout>
  )
}
