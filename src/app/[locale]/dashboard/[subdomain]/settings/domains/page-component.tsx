"use client"

import { useTranslations } from "next-intl"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"

import {
  useAccountState,
  useUpgradeEmailAccountModal,
  validateHandle,
} from "@crossbell/connect-kit"

import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { UniLink } from "~/components/ui/UniLink"
import { useUserRole } from "~/hooks/useUserRole"
import { OUR_DOMAIN } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { checkDomain } from "~/models/site.model"
import { useGetSite, useUpdateHandle, useUpdateSite } from "~/queries/site"

export default function SettingsDomainsPage() {
  const params = useParams()
  const subdomain = params?.subdomain as string

  const updateSite = useUpdateSite()
  const updateHandle = useUpdateHandle()
  const site = useGetSite(subdomain)
  const userRole = useUserRole(subdomain)
  const t = useTranslations()
  const router = useRouter()

  const isEmailAccount = useAccountState(
    (s) => s.computed.account?.type === "email",
  )
  const upgradeAccountModal = useUpgradeEmailAccountModal()

  const form = useForm({
    defaultValues: {
      subdomain: "",
      custom_domain: "",
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    if (site.data?.metadata?.content?.custom_domain !== values.custom_domain) {
      updateSite.mutate({
        characterId: site.data?.characterId,
        custom_domain: values.custom_domain,
      })
    }
    if (subdomain !== values.subdomain) {
      updateHandle.mutate({
        characterId: site.data?.characterId,
        handle: values.subdomain,
      })
    }
  })

  const [customDomain, setCustomDomain] = useState("")
  form.register("custom_domain", {
    onChange: (e) => {
      setCustomDomain(e.target.value)
      toCheckDomain(e.target.value)
    },
  })

  const customSubdomain = customDomain?.split(".").slice(0, -2).join(".") || ""

  useEffect(() => {
    if (!updateSite.isLoading && !updateHandle.isLoading) {
      if (updateSite.isError || updateHandle.isError) {
        toast.error("Failed to update site")
      } else if (updateSite.isSuccess || updateHandle.isSuccess) {
        toast.success("Saved!")
        if (updateHandle.isSuccess) {
          useAccountState
            .getState()
            .refresh()
            .then(() => {
              router.replace(
                `/dashboard/${updateHandle.variables?.handle}/settings/domains`,
              )
            })
        }
      }
    }
  }, [
    updateSite.isSuccess,
    updateSite.isLoading,
    updateHandle.isSuccess,
    updateHandle.isLoading,
  ])

  const [domainCheckResult, setDomainCheckResult] = useState<{
    isLoading: boolean
    data?: boolean
  }>({
    isLoading: false,
    data: true,
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toCheckDomain = (custom: string) => {
    if (custom) {
      setDomainCheckResult({
        isLoading: true,
      })
      checkDomain(custom, form.getValues().subdomain).then((r) =>
        setDomainCheckResult({
          isLoading: false,
          data: r,
        }),
      )
    }
  }

  const [subdomainCheckResult, setSubdomainCheckResult] = useState<{
    isLoading: boolean
    data?: boolean
    error?: string
  }>({
    isLoading: false,
    data: true,
    error: "",
  })
  const toCheckSubdomain = (subdomain: string) => {
    if (subdomain) {
      setSubdomainCheckResult({
        isLoading: true,
      })
      validateHandle(subdomain).then(({ isValid, error, errorMsg }) => {
        setSubdomainCheckResult({
          isLoading: false,
          data: isValid,
          error: errorMsg,
        })
      })
    }
  }

  const [subdomainChanged, setSubdomainChanged] = useState(false)
  form.register("subdomain", {
    onChange: (e) => {
      if (e.target.value !== site.data?.handle) {
        toCheckSubdomain(e.target.value)
        setSubdomainChanged(true)
      } else {
        setSubdomainChanged(false)
      }
    },
  })

  const [hasSet, setHasSet] = useState(false)
  useEffect(() => {
    if (site.isSuccess && site.data && !hasSet) {
      setHasSet(true)
      form.setValue("subdomain", site.data.handle || "")
      form.setValue(
        "custom_domain",
        site.data.metadata?.content?.custom_domain || "",
      )
      setCustomDomain(site.data.metadata?.content?.custom_domain || "")
      toCheckDomain(site.data.metadata?.content?.custom_domain || "")
    }
  }, [form, site.data, site.isSuccess, customDomain, hasSet, toCheckDomain])

  return (
    <SettingsLayout title={"Site Settings"}>
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
          {subdomainChanged && (
            <div className="text-sm mt-2">
              {subdomainCheckResult.isLoading ? (
                <span>{t("Subdomain Checking")}...</span>
              ) : (
                <span
                  className={
                    subdomainCheckResult.data
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {t(
                    subdomainCheckResult.data
                      ? "Subdomain Available"
                      : subdomainCheckResult.error || "Subdomain Unavailable",
                  )}
                </span>
              )}
            </div>
          )}
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
            <div className="mt-2 text-xs space-y-2">
              <p>
                {t(
                  "Set the following record on your DNS provider to active your custom domain",
                )}
                :
              </p>
              <table>
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
              <div className="text-sm">
                {domainCheckResult.isLoading ? (
                  <span>{t("DNS Checking")}...</span>
                ) : domainCheckResult.data ? (
                  <span className="text-green-600">
                    {t("DNS check passed")}
                  </span>
                ) : (
                  <span>
                    <span className="text-red-600">
                      {t("DNS check failed")}
                    </span>
                    <Button
                      className="ml-4 font-medium"
                      variant="secondary"
                      onClick={() => toCheckDomain(customDomain)}
                    >
                      {t("Recheck")}
                    </Button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-5">
          <Button
            type="submit"
            isLoading={updateSite.isLoading || domainCheckResult.isLoading}
            isDisabled={domainCheckResult?.data === false && !!customDomain}
          >
            {t("Save")}
          </Button>
        </div>
      </form>
    </SettingsLayout>
  )
}
