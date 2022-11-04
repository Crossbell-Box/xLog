import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { OUR_DOMAIN, APP_NAME } from "~/lib/env"
import { useGetSite, useUpdateSite } from "~/queries/site"

export default function SettingsDomainsPage() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string

  const updateSite = useUpdateSite()
  const site = useGetSite(subdomain)

  const form = useForm({
    defaultValues: {
      subdomain: "",
      custom_domain: "",
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    updateSite.mutate({
      site: subdomain,
      ...(subdomain !== values.subdomain && { subdomain: values.subdomain }),
      ...(site.data?.custom_domain !== values.custom_domain && {
        custom_domain: values.custom_domain,
      }),
    })
  })

  const [customDomain, setCustomDomain] = useState("")
  form.register("custom_domain", {
    onChange: (e) => setCustomDomain(e.target.value),
  })

  const customSubdomain = customDomain?.split(".").slice(0, -2).join(".") || ""

  useEffect(() => {
    if (updateSite.isSuccess) {
      if (updateSite.data?.code === 0) {
        toast.success("Saved!")
        router.replace(
          `/dashboard/${updateSite.variables?.subdomain}/settings/domains`,
        )
      } else {
        toast.error("Failed to update site" + ": " + updateSite.data.message)
      }
    } else if (updateSite.isError) {
      toast.error("Failed to update site")
    }
  }, [updateSite.isSuccess])

  const [hasSet, setHasSet] = useState(false)
  useEffect(() => {
    if (site.isSuccess && site.data && !hasSet) {
      setHasSet(true)
      form.setValue("subdomain", site.data.username || "")
      form.setValue("custom_domain", site.data.custom_domain || "")
      setCustomDomain(site.data.custom_domain || "")
    }
  }, [form, site.data, site.isSuccess, customDomain, hasSet])

  return (
    <DashboardLayout title={"Domains"}>
      <SettingsLayout title={"Site Settings"} type="site">
        <form onSubmit={handleSubmit}>
          <div>
            <Input
              id="subdomain"
              label={`${APP_NAME} subdomain`}
              addon={`.${OUR_DOMAIN}`}
              className="w-28"
              {...form.register("subdomain")}
            />
          </div>
          <div className="mt-5">
            <Input
              id="custom_domain"
              label="Custom Domain"
              className="w-64"
              {...form.register("custom_domain")}
            />
            {customDomain && (
              <div className="mt-2 text-xs">
                <p className="mb-2">
                  Set the following record on your DNS provider to active your
                  custom domain:
                </p>
                <table className="">
                  <tbody>
                    <tr className="border-b">
                      <th className="text-center p-3">Type</th>
                      <th className="text-center p-3">Name</th>
                      <th className="text-center p-3">Value</th>
                    </tr>
                    <tr className="border-b">
                      <td className="text-center p-3">CNAME</td>
                      <td className="text-center p-3">
                        {customSubdomain || "@"}
                      </td>
                      <td className="text-center p-3">cname.{OUR_DOMAIN}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="text-center p-3">TXT</td>
                      <td className="text-center p-3">{`_xlog-challenge${
                        customSubdomain
                          ? `.${customSubdomain}`
                          : customSubdomain
                      }`}</td>
                      <td className="text-center p-3">{subdomain}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
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
