"use client"

import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { FC, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"

import { MonacoEditor } from "~/components/common/Monaco"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Button } from "~/components/ui/Button"
import { FieldLabel } from "~/components/ui/FieldLabel"
import { useGetState } from "~/hooks/useGetState"
import { getSiteLink } from "~/lib/helpers"
import { useGetSite, useUpdateSite } from "~/queries/site"

export default function SettingsCSSPage() {
  const params = useParams()
  const subdomain = params?.subdomain as string

  const updateSite = useUpdateSite()
  const site = useGetSite(subdomain)
  const t = useTranslations()
  const [css, setCss] = useState("")
  const handleSubmit = (e: any) => {
    e.preventDefault()
    updateSite.mutate({
      characterId: site.data?.characterId,
      css: css,
    })
  }

  useEffect(() => {
    if (updateSite.isSuccess) {
      toast.success("Saved!")
      updateSite.reset()
    } else if (updateSite.isError) {
      toast.error("Failed to update site")
      updateSite.reset()
    }
  }, [updateSite.isSuccess, updateSite.isError])

  const [hasSet, setHasSet] = useState(false)
  useEffect(() => {
    if (site.isSuccess && site.data && !css && !hasSet) {
      setCss(site.data.metadata?.content?.css || "")
      setHasSet(true)
    }
  }, [site.data, site.isSuccess, css, hasSet])

  return (
    <SettingsLayout title={"Site Settings"}>
      <form onSubmit={handleSubmit}>
        <div className="">
          <div className="p-5 text-zinc-500 bg-zinc-50 mb-5 rounded-lg text-xs space-y-2">
            <p className="text-zinc-800 text-sm font-bold">{t("Tips")}:</p>
            <p>
              {t(
                "Scope: These styles will be applied to your entire blog, including this dashboard",
              )}
            </p>
            <p>
              {t(
                "Using a browser plugin that can modify page styles, such as Stylebot, can help with debugging",
              )}
            </p>
            <p>
              {t("Support")} <code>ipfs://</code>
            </p>
            <p>
              {t("CSS variables: xLog provides some built-in CSS variables")}
            </p>
            <p className="pl-2">
              <span className="bg-zinc-200 rounded-lg px-2">
                --theme-color: #4f46e5;
              </span>
            </p>
            <p className="pl-2">
              <span className="bg-zinc-200 rounded-lg px-2">
                --header-height: auto;
              </span>
            </p>
            <p className="pl-2">
              <span className="bg-zinc-200 rounded-lg px-2">
                --banner-bg-color: #000;
              </span>
            </p>
            <p className="pl-2">
              <span className="bg-zinc-200 rounded-lg px-2">
                --font-fans: ui-sans-serif, system-ui, -apple-system,
                BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto,
                &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;,
                sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI
                Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color
                Emoji&quot;;
              </span>
            </p>
          </div>
          <FieldLabel label={t("Custom CSS")} />
          <MonacoEditor
            className="w-full h-96 border outline-none py-3 rounded-lg inline-flex items-center overflow-hidden"
            defaultLanguage="css"
            defaultValue={css}
            onChange={(value) => setCss(value || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
            }}
          />
        </div>
        <div className="mt-5 space-x-2">
          <PreviewButton
            css={css}
            subdomain={subdomain}
            custom_domain={site.data?.metadata.content.custom_domain}
          />
          <Button type="submit" isLoading={updateSite.isLoading}>
            {t("Save")}
          </Button>
        </div>
      </form>
    </SettingsLayout>
  )
}

const PreviewButton: FC<{
  css: string
  subdomain: string
  custom_domain?: string
}> = ({ css, subdomain, custom_domain }) => {
  const t = useTranslations()

  const datasetRef = useRef({
    previewWindowOrigin: "",
    previewWindow: null as null | Window,
  }).current
  const [isInPreview, setIsPreview] = useState(false)

  const handlePreview = () => {
    let url: URL = new URL(
      getSiteLink({
        subdomain,
        domain: custom_domain,
      }),
    )

    url.searchParams.set("css-preview", "true")

    const finalUrl = url.toString()

    const forkWindow = window.open(finalUrl)
    if (!forkWindow) {
      toast.error("Failed to open preview window")
      return
    }

    datasetRef.previewWindowOrigin = url.origin
    datasetRef.previewWindow = forkWindow
    setIsPreview(true)
  }

  const getCSS = useGetState(css)

  useEffect(() => {
    if (!isInPreview) return

    const handler = (e: MessageEvent<any>): void => {
      const { previewWindowOrigin, previewWindow } = datasetRef

      if (!isInPreview) return
      if (e.origin !== previewWindowOrigin) return

      if (!previewWindow) return
      previewWindow.postMessage(
        JSON.stringify({
          type: "preview",
          data: { css: getCSS() },
        }),
        previewWindowOrigin,
      )
    }
    window.addEventListener("message", handler)

    return () => {
      window.removeEventListener("message", handler)
    }
  }, [isInPreview])

  const getIsPreview = useGetState(isInPreview)
  useEffect(() => {
    if (!getIsPreview()) return

    if (!datasetRef.previewWindow) return

    datasetRef.previewWindow.postMessage(
      JSON.stringify({
        type: "preview",
        data: { css: getCSS() },
      }),
      datasetRef.previewWindowOrigin,
    )
  }, [css])

  return (
    <Button variant="secondary" onClick={handlePreview}>
      {t("Preview")}
    </Button>
  )
}
