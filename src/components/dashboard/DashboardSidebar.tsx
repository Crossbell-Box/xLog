export const DashboardSidebar: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div className="w-sidebar fixed top-0 bottom-0 left-0 bg-zinc-50 z-10">
      {children}
      <div className="w-[1px] bg-border absolute top-0 right-0 bottom-0"></div>
    </div>
  )
}
