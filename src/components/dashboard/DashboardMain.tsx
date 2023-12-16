import { useTranslations } from "next-intl"

import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { cn } from "~/lib/utils"

export const DashboardMain = ({
  children,
  fullWidth,
  title,
  className,
}: {
  children: React.ReactNode
  fullWidth?: boolean
  title?: string
  className?: string
}) => {
  const t = useTranslations()
  const isMobileLayout = useIsMobileLayout()

  return (
    <div
      className={cn(
        fullWidth ? "relative" : "min-w-[270px] relative p-5 md:px-10 md:py-8",
        className,
        isMobileLayout ? "max-w-[100vw]" : "",
        "min-h-full flex flex-col bg-white",
      )}
      id="dashboard-main"
    >
      {title && <p className="text-2xl font-bold mb-8">{t(title)}</p>}
      {children}
    </div>
  )
}
