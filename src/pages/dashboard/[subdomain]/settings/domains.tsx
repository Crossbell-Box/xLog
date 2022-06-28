import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { OUR_DOMAIN } from "~/lib/env"
import { getSite, updateSite } from "~/models/site.model"
import { Profile } from "unidata.js"

export default function SettingsDomainsPage() {
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
      subdomain: "",
    },
  })

  let [loading, setLoading] = useState<boolean>(false)
  const handleSubmit = form.handleSubmit((values) => {
    setLoading(true)
    updateSite({
      site: subdomain,
      subdomain: values.subdomain,
    }).then((result) => {
      if (result.code === 0) {
        toast.success("Saved!")
        router.replace(
          `/dashboard/${values.subdomain}/settings/domains`
        )
      } else {
        toast.error("Failed to update site" + ": " + result.message)
      }
      setLoading(false)
    })
  })

  useEffect(() => {
    if (site) {
      form.setValue("subdomain", site.username || "")
    }
  }, [form, site])

  const title = "Site Settings"
  return (
    <DashboardLayout title={"Domains"}>
      <SettingsLayout title={"Site Settings"} type="site">
        <form onSubmit={handleSubmit}>
          <div className="">
            <Input
              id="subdomain"
              label="Subdomain"
              addon={`.${OUR_DOMAIN}`}
              className="w-28"
              {...form.register("subdomain")}
            />
          </div>
          <div className="mt-5">
            <Button type="submit" isLoading={loading}>
              Save
            </Button>
          </div>
        </form>
      </SettingsLayout>
    </DashboardLayout>
  )
}
