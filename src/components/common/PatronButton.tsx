import { Button } from "~/components/ui/Button"
import { Profile } from "~/lib/types"
import { useTranslation } from "next-i18next"
import { cn } from "~/lib/utils"
import { useState } from "react"
import { PatronModal } from "~/components/common/PatronModal"

export const PatronButton: React.FC<{
  site: Profile | undefined | null
  className?: string
  size?: "sm" | "xl"
  loadingStatusChange?: (status: boolean) => void
}> = ({ site, className, size, loadingStatusChange }) => {
  const { t } = useTranslation("common")
  const [open, setOpen] = useState(false)

  return (
    <>
      <PatronModal open={open} setOpen={setOpen} site={site} />
      <Button
        variant="text"
        aria-label={"Patron"}
        key={t("Patron")}
        className={cn(className, "-mx-2 text-red-400")}
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex items-center">
          <i className="text-red-400 text-xl inline-flex items-center">
            <i className="i-mingcute:heart-fill inline-block" />
          </i>
          <span className="text-zinc-500 ml-1">{t("Patron")}</span>
        </span>
      </Button>
    </>
  )
}
