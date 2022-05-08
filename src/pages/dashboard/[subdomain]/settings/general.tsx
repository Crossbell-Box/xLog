import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { AvatarForm } from "~/components/dashboard/AvatarForm"
import { useEffect } from "react"
import toast from "react-hot-toast"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { trpc } from "~/lib/trpc"
import { useFormik } from "formik"

export default function SiteSettingsGeneralPage() {
  const router = useRouter()

  const subdomain = router.query.subdomain as string

  const siteResult = trpc.useQuery(["site", { site: subdomain }], {
    enabled: !!subdomain,
  })
  const site = siteResult.data
  const updateSite = trpc.useMutation("site.updateSite")

  const form = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    onSubmit(values) {
      updateSite.mutate({
        site: subdomain,
        name: values.name,
        description: values.description,
      })
    },
  })

  useEffect(() => {
    if (site) {
      form.setValues({
        name: site.name,
        description: site.description || "",
      })
    }
  }, [site])

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
        <form onSubmit={form.handleSubmit}>
          <div className="mt-5">
            <Input
              required
              label="Name"
              id="name"
              name="name"
              value={form.values.name}
              onChange={form.handleChange}
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
              rows={6}
              value={form.values.description}
              onChange={form.handleChange}
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
