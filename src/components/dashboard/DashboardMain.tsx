import { cn } from "~/lib/utils"
import { useTranslation } from "next-i18next"

export const DashboardMain: React.FC<{
  children: React.ReactNode
  fullWidth?: boolean
  title?: string
  className?: string
}> = ({ children, fullWidth, title, className }) => {
  const { t } = useTranslation("dashboard")

  return (
    <div className="flex-1 overflow-scroll">
      <div
        className={cn(
          fullWidth
            ? "relative"
            : "max-w-screen-2xl min-w-[270px] relative px-5 py-5 md:px-10",
          className,
        )}
      >
        {title && <p className="text-2xl font-bold mb-8">{t(title)}</p>}
        {children}
      </div>
    </div>
  )
}
