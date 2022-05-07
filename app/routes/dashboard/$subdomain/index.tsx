import { DashboardMain } from "~/components/dashboard/DashboardMain"

export const loader = () => {
  return { foo: 1 }
}

export default function SubdomainIndex() {
  return <DashboardMain>hi</DashboardMain>
}
