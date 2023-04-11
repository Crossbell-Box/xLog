import { Profile } from "~/lib/types"
import { useAccountSites } from "~/queries/site"
import { useForm } from "react-hook-form"
import { useAccountState } from "@crossbell/connect-kit"
import { useState, useEffect } from "react"
import { useCommentPage, useUpdateComment } from "~/queries/page"
import { useRouter } from "next/router"
import { useTranslation } from "next-i18next"

export const SearchInput: React.FC<{
  characterId?: string
  value?: string
}> = ({ characterId, value }) => {
  const account = useAccountState((s) => s.computed.account)
  const userSites = useAccountSites()
  const commentPage = useCommentPage()
  const updateComment = useUpdateComment()
  const router = useRouter()
  const [viewer, setViewer] = useState<Profile | null>(null)
  const { t } = useTranslation(["common", "site"])

  useEffect(() => {
    if (userSites.isSuccess && userSites.data?.length) {
      setViewer(userSites.data[0])
    }
  }, [userSites, router])

  const form = useForm({
    defaultValues: {
      content: value || "",
    },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    router.push(`/search?q=${values.content}`)
  })

  useEffect(() => {
    if (commentPage.isSuccess || updateComment.isSuccess) {
      form.reset()
    }
  }, [commentPage.isSuccess, updateComment.isSuccess, form])

  return (
    <div className="xlog-comment-input flex">
      <form className="w-full relative" onSubmit={handleSubmit}>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl text-zinc-500 h-11 w-14 flex items-center justify-center cursor-pointer"
          onClick={handleSubmit}
        >
          <i className="i-mingcute:search-line block"></i>
        </div>
        <input
          id="content"
          className="rounded-full w-full pl-12 pr-5 h-11 border outline-none hover:shadow-md focus:shadow-md transition-shadow"
          placeholder={t("Search for your interest", { ns: "site" }) || ""}
          {...form.register("content", {})}
        />
      </form>
    </div>
  )
}
