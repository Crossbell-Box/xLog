"use client"

import type { NoteMetadata } from "crossbell"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"

import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { ImportPreview } from "~/components/dashboard/ImportPreview"
import { Button } from "~/components/ui/Button"
import { useCheckMirror, useGetMirrorXyz, usePostNotes } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export default function ImportMirrorPage() {
  const params = useParams()
  const subdomain = params?.subdomain as string
  const site = useGetSite(subdomain)
  const t = useTranslations()
  const form = useForm({
    defaultValues: {
      type: "post",
    },
  })
  const postNotes = usePostNotes()
  const mirrorXyz = useGetMirrorXyz({
    address: site.data?.owner,
  })
  const checkMirror = useCheckMirror(site.data?.characterId)

  const notes = mirrorXyz?.data?.map((note) => ({
    title: note.title,
    content: note.content,
    tags: ["post", ...note.tags],
    sources: ["xlog"],
    attributes: [
      {
        trait_type: "xlog_slug",
        value: note.slug,
      },
    ],
    date_published: note.date_published,
    external_urls: [...note.external_urls],
  }))

  const handleSubmit = form.handleSubmit(async (values) => {
    if (notes?.length && site.data?.handle && site.data.characterId) {
      postNotes.mutate({
        siteId: site.data.handle,
        characterId: site.data.characterId,
        notes: notes,
      })
    }
  })

  useEffect(() => {
    if (postNotes.isSuccess) {
      form.reset()
      toast.success("Notes imported successfully")
    }
  }, [postNotes.isSuccess, form])

  return (
    <DashboardMain title="Import from Mirrorxyz">
      {checkMirror?.data ? (
        <form onSubmit={handleSubmit}>
          <div className="min-w-[270px] max-w-screen-lg flex flex-col space-y-4">
            <div>
              <div className="form-label">
                {t("Preview your Mirrorxyz entries")}
              </div>
              {notes?.length ? (
                notes?.map((note: NoteMetadata) => (
                  <ImportPreview key={note.title} note={note} />
                ))
              ) : (
                <div className="text-gray-500">{t("No entries")}</div>
              )}
            </div>
            <div>
              <Button
                isAutoWidth={true}
                type="submit"
                isLoading={
                  site.isLoading || mirrorXyz.isLoading || postNotes.isLoading
                }
                disabled={!notes?.length}
              >
                {t("Import")}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-gray-500">
          {t(
            "You have already imported them, please enter the post page to create a new post!",
          )}
        </div>
      )}
    </DashboardMain>
  )
}
