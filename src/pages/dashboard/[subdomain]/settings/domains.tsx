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
import { useAccountState, useUpgradeAccountModal } from "@crossbell/connect-kit"
import { UniLink } from "~/components/ui/UniLink"
import { getSiteLink } from "~/lib/helpers"
import type { ReactElement } from "react"
import { useUserRole } from "~/hooks/useUserRole"
import { useTranslation } from "next-i18next"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { GetServerSideProps } from "next"
import { serverSidePropsHandler } from "~/lib/server-side-props"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const { props: layoutProps } = await getLayoutServerSideProps(ctx)

    return {
      props: {
        ...layoutProps,
      },
    }
  },
)

export default function SettingsDomainsPage() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string

  const updateSite = useUpdateSite()
  const site = useGetSite(subdomain)
  const userRole = useUserRole(subdomain)
  const { t } = useTranslation("dashboard")

  const isEmailAccount = useAccountState(
    (s) => s.computed.account?.type === "email",
  )
  const upgradeAccountModal = useUpgradeAccountModal()

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
    <SettingsLayout title={"Site Settings"} type="site">
      <form onSubmit={handleSubmit}>
        <div>
          <Input
            id="subdomain"
            label={`xLog ${t("subdomain")}`}
            addon={`.${OUR_DOMAIN}`}
            className="w-28"
            {...form.register("subdomain")}
            disabled={isEmailAccount || userRole?.data === "operator"}
          />
          {isEmailAccount && (
            <div className="text-sm text-orange-400 mt-1">
              Email users cannot change subdomain/handle.{" "}
              <UniLink
                className="underline"
                href={
                  getSiteLink({
                    subdomain: "crossbell-blog",
                  }) + "/newbie-villa"
                }
              >
                Learn more
              </UniLink>{" "}
              or{" "}
              <span
                className="underline cursor-pointer"
                onClick={upgradeAccountModal.show}
              >
                upgrade account
              </span>
              .
            </div>
          )}
          {userRole.data === "operator" && (
            <div className="text-sm text-orange-400 mt-1">
              Operators cannot change subdomain/handle. Please contact the site
              owner.
            </div>
          )}
        </div>
        <div className="mt-5">
          <Input
            id="custom_domain"
            label={t("Custom Domain") || ""}
            className="w-64"
            {...form.register("custom_domain")}
          />
          {customDomain && (
            <div className="mt-2 text-xs">
              <p className="mb-2">
                {t(
                  "Set the following record on your DNS provider to active your custom domain",
                )}
                :
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
                      customSubdomain ? `.${customSubdomain}` : customSubdomain
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
            {t("Save")}
          </Button>
        </div>
      </form>
    </SettingsLayout>
  )
}

SettingsDomainsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Site Settings">{page}</DashboardLayout>
}
