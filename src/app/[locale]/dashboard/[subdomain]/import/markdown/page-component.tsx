"use client"

import type { NoteMetadata } from "crossbell"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"

import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { ImportPreview } from "~/components/dashboard/ImportPreview"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { readFiles } from "~/lib/read-files"
import { usePostNotes } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export default function ImportMarkdownPage() {
  const params = useParams()
  const subdomain = params?.subdomain as string
  const site = useGetSite(subdomain)
  const t = useTranslations()
  const form = useForm({
    defaultValues: {
      type: "post",
      files: [],
    },
  })
  const postNotes = usePostNotes()

  const [notes, setNotes] = useState<NoteMetadata[]>()

  const handleSubmit = form.handleSubmit(async (values) => {
    if (notes?.length && site.data?.handle && site.data.characterId) {
      postNotes.mutate({
        siteId: site.data.handle,
        characterId: site.data.characterId,
        notes,
      })
    }
  })

  form.register("files", {
    onChange: async (e) => {
      const files = await readFiles(e.target.files)
      const notes = files.map((file) => {
        return {
          title: file.title,
          content: file.content,
          tags: ["post", ...file.tags],
          sources: ["xlog"],
          attributes: [
            {
              trait_type: "xlog_slug",
              value: file.slug,
            },
          ],
          date_published: file.date_published,
        }
      })
      setNotes(notes)
    },
  })

  useEffect(() => {
    if (postNotes.isSuccess) {
      form.reset()
      toast.success("Notes imported successfully")
    }
  }, [postNotes.isSuccess, form])

  return (
    <DashboardMain title="Import from Markdown files">
      <form onSubmit={handleSubmit}>
        <div className="min-w-[270px] max-w-screen-lg flex flex-col space-y-4">
          <Input
            className="py-1"
            label={t(`Select Markdown Files`) || ""}
            id="notes"
            type="file"
            accept=".md"
            multiple={true}
            help={t(
              "Please select md files, multiple files are supported, and front matter is supported",
            )}
            {...form.register("files", {})}
          />
          <div>
            <div className="form-label">{t("Preview")}</div>
            {notes?.length ? (
              notes?.map((note) => (
                <ImportPreview key={note.title} note={note} />
              ))
            ) : (
              <div className="text-gray-500">{t("No files chosen")}</div>
            )}
          </div>
          <div>
            <Button
              isAutoWidth={true}
              type="submit"
              isLoading={site.isLoading || postNotes.isLoading}
              disabled={!notes?.length}
            >
              {t("Import")}
            </Button>
          </div>
        </div>
      </form>
    </DashboardMain>
  )
}
