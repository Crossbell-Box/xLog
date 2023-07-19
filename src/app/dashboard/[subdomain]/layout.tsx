import LayoutComponent from "./layout-component"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LayoutComponent>{children}</LayoutComponent>
}
