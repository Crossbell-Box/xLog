import { Button } from "~/components/ui/Button"
import { Profile } from "~/lib/types"
import { useTranslation } from "next-i18next"
import { HeartIcon } from "@heroicons/react/24/outline"
import { cn } from "~/lib/utils"
import { Modal } from "~/components/ui/Modal"
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
        className={cn(className, "-mx-2")}
        onClick={() => setOpen(true)}
      >
        <HeartIcon className="text-red-400 flex w-5 h-5 -mb-[1px]" />
        <span className="text-zinc-500 ml-1">Patron</span>
      </Button>
    </>
  )
}
