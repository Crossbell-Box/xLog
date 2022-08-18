import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Button } from "~/components/ui/Button"
import { useGetSite, useUpdateSite } from "~/queries/site"
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react"
import { FieldLabel } from "~/components/ui/FieldLabel"

export default function SettingsDomainsPage() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string

  const updateSite = useUpdateSite()
  const site = useGetSite(subdomain)

  const [css, setCss] = useState("")
  const handleSubmit = (e: any) => {
    e.preventDefault()
    updateSite.mutate({
      site: subdomain,
      css: css,
    })
  }

  useEffect(() => {
    if (updateSite.isSuccess) {
      if (updateSite.data?.code === 0) {
        toast.success("Saved!")
      } else {
        toast.error("Failed to update site" + ": " + updateSite.data.message)
      }
    } else if (updateSite.isError) {
      toast.error("Failed to update site")
    }
  }, [updateSite.isSuccess, updateSite.isError])

  useEffect(() => {
    if (site.isSuccess && site.data && !css) {
      setCss(site.data.css || "")
    }
  }, [site.data, site.isSuccess, css])

  const title = "Site Settings"
  return (
    <DashboardLayout title={"Domains"}>
      <SettingsLayout title={"Site Settings"} type="site">
        <form onSubmit={handleSubmit}>
          <div className="">
            <FieldLabel label="Custom CSS" />
            <Editor
              className="w-full h-96 border outline-none py-3 rounded-lg inline-flex items-center overflow-hidden"
              defaultLanguage="css"
              defaultValue={css}
              onChange={(value) => setCss(value || "")}
              options={{
                fontSize: 14,
              }}
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
