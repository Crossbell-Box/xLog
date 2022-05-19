import { useRouter } from "next/router"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { OUR_DOMAIN } from "~/lib/env"
import { trpc } from "~/lib/trpc"

export default function SettingsDomainsPage() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string
  const siteResult = trpc.useQuery(["site", { site: subdomain }], {
    enabled: !!subdomain,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const ctx = trpc.useContext()
  const updateSite = trpc.useMutation("site.updateSite")

  const form = useForm({
    defaultValues: {
      subdomain: "",
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    updateSite.mutate({
      site: siteResult.data!.id,
      subdomain: values.subdomain,
    })
  })

  useEffect(() => {
    if (updateSite.isSuccess && updateSite.data) {
      toast.success("Saved!")
      updateSite.reset()
      ctx.invalidateQueries()
      if (updateSite.data.subdomainUpdated) {
        router.replace(
          `/dashboard/${updateSite.data.site.subdomain}/settings/domains`
        )
      }
    }
  }, [ctx, router, updateSite])

  useEffect(() => {
    if (siteResult.data) {
      form.setValue("subdomain", siteResult.data.subdomain)
    }
  }, [form, siteResult.data])

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
              error={updateSite.error?.message}
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
