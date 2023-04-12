import { useForm } from "react-hook-form"
import { useRouter } from "next/router"
import { useTranslation } from "next-i18next"
import { cn } from "~/lib/utils"

export const SearchInput: React.FC<{
  value?: string
  noBorder?: boolean
  onSubmit?: (value?: string) => void
}> = ({ value, noBorder, onSubmit }) => {
  const router = useRouter()
  const { t } = useTranslation(["common", "site"])

  const form = useForm({
    defaultValues: {
      content: value || "",
    },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    router.push(`/search?q=${values.content}`)
    onSubmit?.(values.content)
  })

  return (
    <div className="xlog-comment-input flex">
      <form className="w-full relative" onSubmit={handleSubmit}>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl text-zinc-500 h-11 w-14 flex items-center justify-center cursor-pointer"
          onClick={handleSubmit}
        >
          <i className="i-mingcute:search-line block" />
        </div>
        <input
          id="content"
          className={cn(
            "w-full pl-12 pr-5 h-11 outline-none",
            !noBorder &&
              "border rounded-full hover:shadow-md focus:shadow-md transition-shadow",
          )}
          placeholder={t("Search for your interest") || ""}
          {...form.register("content", {})}
        />
      </form>
    </div>
  )
}
