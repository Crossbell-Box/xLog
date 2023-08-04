"use client"

import { nanoid } from "nanoid"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ChangeEvent, memo, useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

import { DateInput } from "@mantine/dates"
import { useQueryClient } from "@tanstack/react-query"

import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { PublishButton } from "~/components/dashboard/PublishButton"
import { Button } from "~/components/ui/Button"
import { FieldLabel } from "~/components/ui/FieldLabel"
import { ImageUploader } from "~/components/ui/ImageUploader"
import { Input } from "~/components/ui/Input"
import { ModalContentProps, useModalStack } from "~/components/ui/ModalStack"
import { UniLink } from "~/components/ui/UniLink"
import {
  Values,
  initialEditorState,
  useEditorState,
} from "~/hooks/useEditorState"
import { useGetState } from "~/hooks/useGetState"
import { useBeforeMounted } from "~/hooks/useSyncOnce"
import { showConfetti } from "~/lib/confetti"
import { CSB_SCAN } from "~/lib/env"
import { getTwitterShareUrl } from "~/lib/helpers"
import { useTranslation } from "~/lib/i18n/client"
import { getPageVisibility } from "~/lib/page-helpers"
import { delStorage, setStorage } from "~/lib/storage"
import { PageVisibilityEnum } from "~/lib/types"
import { cn } from "~/lib/utils"
import {
  useCreatePage,
  useDeletePage,
  useGetPage,
  useUpdatePage,
} from "~/queries/page"
import { useGetSite } from "~/queries/site"

export default function PortfolioEditor() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { t } = useTranslation("dashboard")
  const params = useParams()
  const subdomain = params?.subdomain as string
  const searchParams = useSearchParams()

  let pageId = searchParams?.get("id") as string | undefined
  const type = "portfolio"

  const site = useGetSite(subdomain)

  const [draftKey, setDraftKey] = useState<string>("")
  useEffect(() => {
    if (subdomain) {
      let key
      if (!pageId) {
        const randomId = nanoid()
        key = `draft-${site.data?.characterId}-!local-${randomId}`
        setDraftKey(key)
        queryClient.invalidateQueries([
          "getPagesBySite",
          site.data?.characterId,
        ])
        router.replace(
          `/dashboard/${subdomain}/editor?id=!local-${randomId}&type=${type}`,
        )
      } else {
        key = `draft-${site.data?.characterId}-${pageId}`
      }
      setDraftKey(key)
    }
  }, [
    subdomain,
    pageId,
    queryClient,
    router,
    site.data?.characterId,
    searchParams,
  ])

  const page = useGetPage({
    characterId: site.data?.characterId,
    noteId: pageId && /\d+/.test(pageId) ? +pageId : undefined,
    slug: pageId || draftKey.replace(`draft-${site.data?.characterId}-`, ""),
    handle: subdomain,
  })

  const [visibility, setVisibility] = useState<PageVisibilityEnum>()

  useEffect(() => {
    if (page.isSuccess) {
      setVisibility(getPageVisibility(page.data || undefined))
    }
  }, [page.isSuccess, page.data])

  // reset editor state when page changes
  useBeforeMounted(() => {
    useEditorState.setState({
      ...initialEditorState,
    })
  })

  const values = useEditorState()

  const getValues = useGetState(values)
  const getDraftKey = useGetState(draftKey)

  const updateValue = useCallback(
    <K extends keyof Values>(key: K, value: Values[K]) => {
      if (visibility !== PageVisibilityEnum.Draft) {
        setVisibility(PageVisibilityEnum.Modified)
      }

      const values = getValues()
      const draftKey = getDraftKey()
      const newValues = { ...values, [key]: value }
      if (draftKey) {
        setStorage(draftKey, {
          date: +new Date(),
          values: newValues,
          type,
        })
        queryClient.invalidateQueries([
          "getPagesBySite",
          site.data?.characterId,
        ])
      }
      useEditorState.setState(newValues)
    },
    [type, queryClient, subdomain, visibility],
  )

  const createPage = useCreatePage()
  const updatePage = useUpdatePage()

  const savePage = async () => {
    const baseValues = {
      ...values,
      characterId: site.data?.characterId,
      cover: values.cover,
    }
    if (visibility === PageVisibilityEnum.Draft) {
      createPage.mutate({
        ...baseValues,
        type,
      })
    } else {
      updatePage.mutate({
        ...baseValues,
        noteId: page?.data?.noteId,
      })
    }
  }

  const deleteP = useDeletePage()
  const deletePage = async () => {
    if (page.data) {
      if (!page.data?.noteId) {
        // Is draft
        delStorage(`draft-${page.data.characterId}-${page.data.draftKey}`)
      } else {
        // Is Note
        return deleteP.mutate({
          noteId: page.data.noteId,
          characterId: page.data.characterId,
        })
      }
    }
  }

  useEffect(() => {
    if (deleteP.isSuccess) {
      toast.success(t("Deleted!"))
      deleteP.reset()
      router.push(`/dashboard/${subdomain}/${type}s`)
    }
  }, [deleteP.isSuccess])

  const { present } = useModalStack()

  useEffect(() => {
    if (createPage.isSuccess || updatePage.isSuccess) {
      if (draftKey) {
        delStorage(draftKey)
        queryClient.invalidateQueries([
          "getPagesBySite",
          site.data?.characterId,
        ])
        queryClient.invalidateQueries([
          "getPage",
          draftKey.replace(`draft-${site.data?.characterId}-`, ""),
        ])
      } else {
        queryClient.invalidateQueries(["getPage", pageId])
      }

      if (createPage.data?.noteId) {
        router.replace(
          `/dashboard/${subdomain}/editor?id=${createPage.data?.noteId}&type=${type}`,
        )
      }

      const transactionUrl = `${CSB_SCAN}/tx/${
        page.data?.updatedTransactionHash || page.data?.transactionHash // TODO
      }`

      const modalId = "publish-modal"
      present({
        title: `🎉 ${t("Published!")}`,
        id: modalId,
        content: (props) => (
          <PublishedModal transactionUrl={transactionUrl} {...props} />
        ),
      })

      showConfetti()

      createPage.reset()
      updatePage.reset()
    }
  }, [createPage.isSuccess, updatePage.isSuccess])

  useEffect(() => {
    if (createPage.isError || updatePage.isError) {
      toast.error("Error: " + (createPage.error || updatePage.error))
      createPage.reset()
      updatePage.reset()
    }
  }, [createPage.isError, updatePage.isSuccess])

  useEffect(() => {
    if (!page.data?.metadata || !draftKey) return
    useEditorState.setState({
      published: !!page.data.noteId,
      title: page.data.metadata?.content?.title || "",
      publishedAt: page.data.metadata?.content?.date_published,
      excerpt: page.data.metadata?.content?.summary || "",
      cover: page.data.metadata?.content?.attachments?.find(
        (attachment) => attachment.name === "cover",
      ) || {
        address: "",
        mime_type: "",
      },
      externalUrl: page.data.metadata?.content?.external_urls?.[0] || "",
    })
  }, [page.data, subdomain, draftKey, site.data?.characterId])

  const discardChanges = useCallback(() => {
    if (draftKey) {
      delStorage(draftKey)
      queryClient.invalidateQueries(["getPagesBySite", site.data?.characterId])
      page.remove()
      page.refetch()
    }
  }, [draftKey, site.data?.characterId])

  return (
    <>
      <DashboardMain fullWidth>
        <div className="min-w-[270px] max-w-screen-lg flex flex-col space-y-8">
          {page.isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              {t("Loading")}...
            </div>
          ) : (
            <>
              <div className={`pt-10 flex w-full min-w-[840px] px-5`}>
                <EditorExtraProperties updateValue={updateValue} />
              </div>
              <div
                className={`flex justify-between px-5 h-14 items-center text-sm`}
              >
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <PublishButton
                    savePage={savePage}
                    deletePage={deletePage}
                    twitterShareUrl={
                      page.data && site.data
                        ? getTwitterShareUrl({
                            page: page.data,
                            site: site.data,
                            t,
                          })
                        : ""
                    }
                    published={visibility !== PageVisibilityEnum.Draft}
                    isSaving={
                      createPage.isLoading ||
                      updatePage.isLoading ||
                      deleteP.isLoading
                    }
                    isDisabled={
                      visibility !== PageVisibilityEnum.Modified &&
                      visibility !== PageVisibilityEnum.Draft
                    }
                    type={type}
                    isModified={visibility === PageVisibilityEnum.Modified}
                    discardChanges={discardChanges}
                  />
                  <span
                    className={cn(
                      `text-sm capitalize`,
                      visibility === PageVisibilityEnum.Draft
                        ? `text-zinc-300`
                        : visibility === PageVisibilityEnum.Modified
                        ? "text-orange-600"
                        : "text-green-600",
                    )}
                  >
                    {t(visibility as string)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardMain>
    </>
  )
}

const EditorExtraProperties = memo(
  ({
    updateValue,
  }: {
    updateValue: <K extends keyof Values>(key: K, value: Values[K]) => void
  }) => {
    const values = useEditorState()
    const { t } = useTranslation("dashboard")

    return (
      <div className="w-full space-y-5">
        <div>
          <Input
            label={t("External Url") || ""}
            isBlock
            name="externalUrl"
            id="externalUrl"
            value={values.externalUrl}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              updateValue("externalUrl", e.target.value)
            }}
          />
        </div>
        <div>
          <FieldLabel label={t("Cover Image")} />
          <ImageUploader
            id="icon"
            className="aspect-video rounded-lg w-[480px]"
            value={values.cover as any}
            hasClose={true}
            withMimeType={true}
            uploadEnd={(key) => {
              const { address, mime_type } = key as {
                address?: string
                mime_type?: string
              }
              updateValue("cover", {
                address,
                mime_type,
              })
            }}
            accept="image/*"
          />
        </div>
        <div>
          <Input
            label={t("Title") || ""}
            isBlock
            name="title"
            id="title"
            value={values.title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              updateValue("title", e.target.value)
            }}
          />
        </div>
        <div>
          <Input
            label={t("Excerpt") || ""}
            isBlock
            name="excerpt"
            id="excerpt"
            value={values.excerpt}
            multiline
            rows={4}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              updateValue("excerpt", e.target.value)
            }}
          />
        </div>
        <div>
          <label className="form-label" htmlFor="publishAt">
            {t("Publish at")}
          </label>
          <DateInput
            className="[&_input]:text-black/90"
            allowDeselect
            clearable
            valueFormat="YYYY-MM-DD, h:mm a"
            name="publishAt"
            id="publishAt"
            value={
              values.publishedAt ? new Date(values.publishedAt) : undefined
            }
            onChange={(value: Date | null) => {
              if (value) {
                updateValue("publishedAt", value.toISOString())
              } else {
                updateValue("publishedAt", "")
              }
            }}
            styles={{
              input: {
                borderRadius: "0.5rem",
                borderColor: "var(--border-color)",
                height: "2.5rem",
                "&:focus-within": {
                  borderColor: "var(--theme-color)",
                },
              },
            }}
          />
          <div className="text-xs text-gray-400 mt-1">
            {t(
              `This portfolio will be accessible from this time. Leave blank to use the current time.`,
            )}
          </div>
          {values.publishedAt > new Date().toISOString() && (
            <div className="text-xs mt-1 text-orange-500">
              {t(
                "The post is currently not public as its publication date has been scheduled for a future time.",
              )}
            </div>
          )}
        </div>
      </div>
    )
  },
)

EditorExtraProperties.displayName = "EditorExtraProperties"

const PublishedModal = ({
  dismiss,
  transactionUrl,
}: ModalContentProps<{
  transactionUrl: string
}>) => {
  const { t } = useTranslation("dashboard")
  return (
    <>
      <div className="p-5">
        {t(
          "Your post has been securely stored on the blockchain. Now you may want to",
        )}
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <UniLink className="text-accent" href={transactionUrl}>
              {t("View the transaction")}
            </UniLink>
          </li>
        </ul>
      </div>
      <div className="h-16 border-t flex items-center px-5">
        <Button isBlock onClick={() => dismiss()}>
          {t("Got it, thanks!")}
        </Button>
      </div>
    </>
  )
}
