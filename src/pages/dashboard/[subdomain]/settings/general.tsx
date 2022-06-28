import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { AvatarForm } from "~/components/dashboard/AvatarForm"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { trpc } from "~/lib/trpc"
import { useForm } from "react-hook-form"
import { getSite, updateSite } from "~/models/site.model"
import { Profile } from "unidata.js"

export default function SiteSettingsGeneralPage() {
  const router = useRouter()

  const subdomain = router.query.subdomain as string

  let [site, setSite] = useState<Profile | null>(null)

  useEffect(() => {
    if (subdomain) {
      getSite(subdomain).then((site) => {
        setSite(site)
      })
    }
  }, [subdomain])

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  })

  let [loading, setLoading] = useState<boolean>(false)
  const handleSubmit = form.handleSubmit((values) => {
    setLoading(true)
    updateSite({
      site: subdomain,
      name: values.name,
      description: values.description,
    }).then((result) => {
      if (result.code === 0) {
        toast.success("Site updated")
      } else {
        toast.error("Failed to update site" + ": " + result.message)
      }
      setLoading(false)
    })
  })

  useEffect(() => {
    if (site) {
      form.setValue("name", site.name || "")
      form.setValue("description", site.bio || "")
    }
  }, [site, form])

  return (
    <DashboardLayout title="Site Settings">
      <SettingsLayout title="Site Settings" type="site">
        {site && (
          <div>
            <label className="form-label">Icon</label>
            <AvatarForm
              site={site.username}
              name={site.name || site.username || ""}
              filename={site.avatars?.[0] || undefined}
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
            <textarea
              id="description"
              className="input is-block"
              rows={6}
              {...form.register("description")}
            />
          </div>
          <div className="mt-5">
            <Button type="submit" isLoading={loading}>
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
