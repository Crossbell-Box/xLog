import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { ReactElement, useEffect, useState } from "react"
import { useGetSite } from "~/queries/site"
import { useTranslation } from "next-i18next"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { GetServerSideProps } from "next"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { useForm } from "react-hook-form"
import { Button } from "~/components/ui/Button"
import { getSiteLink } from "~/lib/helpers"
import type { NoteMetadata } from "crossbell.js"
import { ImportPreview } from "~/components/dashboard/ImportPreview"
import { usePostNotes } from "~/queries/page"
import { toast } from "react-hot-toast"
import { useGetMirrorXyz, useCheckMirror } from "~/queries/page"

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

export default function ImportMarkdownPage() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string
  const site = useGetSite(subdomain)
  const { t } = useTranslation("dashboard")
  const form = useForm({
    defaultValues: {
      type: "post",
    },
  })
  const postNotes = usePostNotes()
  const mirrorXyz = useGetMirrorXyz({
    address: site.data?.metadata?.owner,
  })
  const checkeMirror = useCheckMirror(site.data?.metadata?.proof)

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
    external_urls: [
      `${getSiteLink({
        subdomain,
        domain: site.data?.custom_domain,
      })}/${encodeURIComponent(note.slug)}`,
      ...note.external_urls,
    ],
  }))

  const handleSubmit = form.handleSubmit(async (values) => {
    if (notes?.length && site.data?.username && site.data.metadata?.proof) {
      postNotes.mutate({
        siteId: site.data.username,
        characterId: site.data.metadata.proof,
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
    <DashboardMain title="Import from Mirror.xyz">
      {checkeMirror?.data ? (
        <form onSubmit={handleSubmit}>
          <div className="min-w-[270px] max-w-screen-lg flex flex-col space-y-4">
            <div>
              <div className="form-label">
                {t("Preview your Mirror.xyz entries")}
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

ImportMarkdownPage.getLayout = (page: ReactElement) => {
  return (
    <DashboardLayout title="Import from Mirror.xyz">{page}</DashboardLayout>
  )
}
