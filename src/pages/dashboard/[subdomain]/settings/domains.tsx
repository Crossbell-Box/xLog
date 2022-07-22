import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { OUR_DOMAIN } from "~/lib/env"
import { useGetSite, useUpdateSite } from "~/queries/site"

export default function SettingsDomainsPage() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string

  const updateSite = useUpdateSite()
  const site = useGetSite(subdomain)

  const form = useForm({
    defaultValues: {
      subdomain: "",
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    updateSite.mutate({
      site: subdomain,
      subdomain: values.subdomain,
    })
    updateSite.mutate({
      site: subdomain,
      subdomain: values.subdomain,
    })
  })

  useEffect(() => {
    if (updateSite.isSuccess) {
      if (updateSite.data?.code === 0) {
        toast.success("Saved!")
        router.replace(
          `/dashboard/${updateSite.variables?.subdomain}/settings/domains`
        )
      } else {
        toast.error("Failed to update site" + ": " + updateSite.data.message)
      }
    } else if (updateSite.isError) {
      toast.error("Failed to update site")
    }
  }, [updateSite, router])

  useEffect(() => {
    if (site.isSuccess && site.data) {
      form.setValue("subdomain", site.data.username || "")
    }
  }, [form, site.data, site.isSuccess])

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
            <Button type="submit" isLoading={updateSite.isLoading}>
              Save
            </Button>
          </div>
        </form>
      </SettingsLayout>
    </DashboardLayout>
  )
}
