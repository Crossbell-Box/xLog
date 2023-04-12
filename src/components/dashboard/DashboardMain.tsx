import { cn } from "~/lib/utils"
import { useTranslation } from "next-i18next"
import { useMobileLayout } from "~/hooks/useMobileLayout"

export const DashboardMain: React.FC<{
  children: React.ReactNode
  fullWidth?: boolean
  title?: string
  className?: string
}> = ({ children, fullWidth, title, className }) => {
  const { t } = useTranslation("dashboard")
  const isMobileLayout = useMobileLayout()

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
