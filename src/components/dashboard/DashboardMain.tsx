import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { useTranslation } from "~/lib/i18n/client"
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
  const { t } = useTranslation("dashboard")
  const isMobileLayout = useIsMobileLayout()

  return (
    <div className="flex-1">
      <div
        className={cn(
          fullWidth ? "relative" : "min-w-[270px] relative px-5 py-5 md:px-10",
          className,
          isMobileLayout ? "max-w-[100vw]" : "",
        )}
      >
        {title && <p className="text-2xl font-bold mb-8">{t(title)}</p>}
        {children}
      </div>
    </div>
  )
}
