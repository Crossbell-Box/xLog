"use client"

import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"

import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Button } from "~/components/ui/Button"
import { ImageUploader } from "~/components/ui/ImageUploader"
import { Input } from "~/components/ui/Input"
import { UniLink } from "~/components/ui/UniLink"
import { toIPFS } from "~/lib/ipfs-parser"
import { useGetSite, useUpdateSite } from "~/queries/site"

export default function SiteSettingsGeneralPage() {
  const params = useParams()
  const subdomain = params?.subdomain as string

  const updateSite = useUpdateSite()
  const site = useGetSite(subdomain)
  const t = useTranslations()

  const form = useForm({
    defaultValues: {
      icon: "",
      banner: undefined,
      name: "",
      site_name: "",
      description: "",
      footer: "",
      ga: "",
      ua: "",
      uh: "",
    } as {
      icon?: string
      banner?: {
        address: string
        mime_type: string
      }
      name: string
      site_name: string
      description: string
      footer: string
      ga: string
      ua: string
      uh: string
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    updateSite.mutate({
      characterId: site.data?.characterId,
      icon: values.icon,
      banner: values.banner ?? null,
      name: values.name,
      site_name: values.site_name,
      description: values.description,
      footer: values.footer,
      ga: values.ga,
      ua: values.ua,
      uh: values.uh,
    })
  })

  useEffect(() => {
    if (updateSite.isSuccess) {
      toast.success("Site updated")
    } else if (updateSite.isError) {
      toast.error("Failed to update site")
    }
  }, [updateSite.isSuccess, updateSite.isError])

  useEffect(() => {
    if (site.data) {
      !form.getValues("icon") &&
        form.setValue(
          "icon",
          toIPFS(site.data?.metadata?.content?.avatars?.[0] || ""),
        )
      !form.getValues("banner") &&
        form.setValue(
          "banner",
          site.data?.metadata?.content?.banners?.[0]?.address
            ? {
                address: toIPFS(
                  site.data?.metadata?.content?.banners?.[0].address || "",
                ),
                mime_type: site.data?.metadata?.content?.banners?.[0].mime_type,
              }
            : undefined,
        )
      !form.getValues("name") &&
        form.setValue("name", site.data.metadata?.content?.name || "")
      !form.getValues("site_name") &&
        form.setValue("site_name", site.data.metadata?.content?.site_name || "")
      !form.getValues("description") &&
        form.setValue("description", site.data.metadata?.content?.bio || "")
      !form.getValues("footer") &&
        form.setValue("footer", site.data.metadata?.content?.footer || "")
      !form.getValues("ga") &&
        form.setValue("ga", site.data.metadata?.content?.ga || "")
      !form.getValues("ua") &&
        form.setValue("ua", site.data.metadata?.content?.ua || "")
      !form.getValues("uh") &&
        form.setValue("uh", site.data.metadata?.content?.uh || "")
    }
  }, [site.data, form])

  const [iconUploading, setIconUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)

  return (
    <SettingsLayout title="Site Settings">
      <form onSubmit={handleSubmit}>
        <div className="mt-5">
          <label htmlFor="icon" className="form-label">
            {t("Icon")}
          </label>
          <Controller
            name="icon"
            control={form.control}
            render={({ field }) => (
              <ImageUploader
                className="size-24 rounded-full"
                uploadStart={() => {
                  setIconUploading(true)
                }}
                uploadEnd={(key) => {
                  form.setValue("icon", key)
                  setIconUploading(false)
                }}
                accept="image/*"
                {...field}
              />
            )}
          />
        </div>
        <div className="mt-5">
          <label htmlFor="icon" className="form-label">
            {t("Banner")}
          </label>
          <Controller
            name="banner"
            control={form.control}
            render={({ field }) => (
              <ImageUploader
                className="max-w-screen-md h-[220px]"
                uploadStart={() => {
                  setBannerUploading(true)
                }}
                uploadEnd={(key) => {
                  form.setValue("banner", key)
                  setBannerUploading(false)
                }}
                withMimeType={true}
                hasClose={true}
                accept="image/*,video/*"
                {...field}
              />
            )}
          />
          <div className="text-xs text-gray-400 mt-1">
            {t("Supports both pictures and videos")}
          </div>
        </div>
        <div className="mt-5">
          <Input
            required
            label={t("Character Name") || ""}
            id="name"
            {...form.register("name")}
          />
        </div>
        <div className="mt-5">
          <Input
            label={t("Site Name") || ""}
            id="site_name"
            placeholder={form.getValues("name")}
            {...form.register("site_name")}
            help={t(
              "It will appear in the page title and site header, using the character name by default",
            )}
          />
        </div>
        <div className="mt-5">
          <label htmlFor="description" className="form-label">
            {t("Description")}
          </label>
          <Input
            multiline
            id="description"
            className="input is-block"
            rows={2}
            {...form.register("description")}
          />
        </div>
        <div className="mt-5">
          <label htmlFor="footer" className="form-label">
            {t("Footer")}
          </label>
          <Input
            multiline
            id="footer"
            className="input is-block"
            rows={2}
            {...form.register("footer")}
            help={t("Support Markdown")}
          />
        </div>
        <div className="mt-5">
          <Input
            id="ga"
            {...form.register("ga")}
            prefix="G-"
            label="Google Analytics"
            help={
              <p>
                {t.rich("Integrate Google Analytics", {
                  link: (chunks) => (
                    <UniLink
                      className="underline"
                      href="https://support.google.com/analytics/answer/9539598"
                    >
                      {chunks}
                    </UniLink>
                  ),
                })}
              </p>
            }
          />
        </div>
        <div className="mt-5">
          <Input
            id="uh"
            {...form.register("uh")}
            prefix="https://"
            placeholder="analytics.umami.is"
            label="Umami Cloud Analytics"
            help={
              <p>
                {t.rich("Integrate Umami Cloud Analytics (set url)", {
                  link: (chunks) => (
                    <UniLink
                      className="underline"
                      href="https://cloud.umami.is"
                    >
                      {chunks}
                    </UniLink>
                  ),
                })}
              </p>
            }
          />
          <Input
            id="ua"
            className="mt-2"
            {...form.register("ua")}
            placeholder="xxxxxxxx-xxxx-..."
            help={
              <p>
                {t.rich("Integrate Umami Cloud Analytics", {
                  link: (chunks) => (
                    <UniLink
                      className="underline"
                      href="https://umami.is/docs/collect-data"
                    >
                      {chunks}
                    </UniLink>
                  ),
                })}
              </p>
            }
          />
        </div>
        <div className="mt-5">
          <Button
            type="submit"
            isLoading={updateSite.isLoading}
            isDisabled={iconUploading || bannerUploading}
          >
            {t("Save")}
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
  )
}
