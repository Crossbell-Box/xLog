import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { AvatarForm } from "~/components/dashboard/AvatarForm"
import { useEffect } from "react"
import toast from "react-hot-toast"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { useForm } from "react-hook-form"
import { useGetSite, useUpdateSite } from "~/queries/site"
import { UniLink } from "~/components/ui/UniLink"

export default function SiteSettingsGeneralPage() {
  const router = useRouter()

  const subdomain = router.query.subdomain as string

  const updateSite = useUpdateSite()
  const site = useGetSite(subdomain)

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      ga: "",
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    updateSite.mutate({
      site: subdomain,
      name: values.name,
      description: values.description,
      ga: values.ga,
    })
  })

  useEffect(() => {
    if (updateSite.isSuccess) {
      if (updateSite.data?.code === 0) {
        toast.success("Site updated")
      } else {
        toast.error("Failed to update site" + ": " + updateSite.data.message)
      }
    } else if (updateSite.isError) {
      toast.error("Failed to update site")
    }
  }, [updateSite.isSuccess, updateSite.isError])

  useEffect(() => {
    if (site.data) {
      !form.getValues("name") && form.setValue("name", site.data.name || "")
      !form.getValues("description") &&
        form.setValue("description", site.data.bio || "")
      !form.getValues("ga") && form.setValue("ga", site.data.ga || "")
    }
  }, [site.data, form])

  return (
    <DashboardLayout title="Site Settings">
      <SettingsLayout title="Site Settings" type="site">
        {site && (
          <div>
            <label className="form-label">Icon</label>
            <AvatarForm
              site={site.data?.username!}
              name={site.data?.name || site.data?.username || ""}
              filename={site.data?.avatars?.[0] || undefined}
            />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mt-5">
            <Input required label="Name" id="name" {...form.register("name")} />
          </div>
          <div className="mt-5">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <Input
              multiline
              id="description"
              className="input is-block"
              rows={2}
              help="Support Markdown"
              {...form.register("description")}
            />
          </div>
          <div className="mt-5">
            <Input
              id="ga"
              {...form.register("ga")}
              prefix="G-"
              label="Google Analytics"
              help={
                <p>
                  Integrate Google Analytics into your site. You can follow the
                  instructions{" "}
                  <UniLink
                    className="underline"
                    href="https://support.google.com/analytics/answer/9539598"
                  >
                    here
                  </UniLink>{" "}
                  to find your Measurement ID.
                </p>
              }
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
