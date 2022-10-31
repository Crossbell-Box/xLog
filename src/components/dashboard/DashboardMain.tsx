import clsx from "clsx"

export const DashboardMain: React.FC<{
  children: React.ReactNode
  fullWidth?: boolean
}> = ({ children, fullWidth }) => {
  return (
    <div className="md:pl-sidebar w-full">
      <div
        className={clsx(
          fullWidth
            ? "relative"
            : "max-w-screen-2xl relative px-5 py-5 md:px-10",
        )}
      >
        {children}
      </div>
    </div>
  )
}
