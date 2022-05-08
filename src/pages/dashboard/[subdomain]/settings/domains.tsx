import { useFormik } from "formik"
import { useRouter } from "next/router"
import { useEffect } from "react"
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
  })
  const ctx = trpc.useContext()
  const updateSite = trpc.useMutation("site.updateSite")

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
  }, [updateSite])

  useEffect(() => {
    if (siteResult.data) {
      form.setValues({
        subdomain: siteResult.data.subdomain,
      })
    }
  }, [siteResult.data])

  const form = useFormik({
    initialValues: {
      subdomain: "",
    },
    onSubmit(values) {
      updateSite.mutate({
        site: siteResult.data!.id,
        subdomain: values.subdomain,
      })
    },
  })

  return (
    <DashboardLayout>
      <SettingsLayout title="Site Settings" type="site">
        <form onSubmit={form.handleSubmit}>
          <div className="">
            <Input
              name="subdomain"
              id="subdomain"
              label="Subdomain"
              addon={`.${OUR_DOMAIN}`}
              value={form.values.subdomain}
              className="w-28"
              onChange={form.handleChange}
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
