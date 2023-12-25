import { Loading } from "~/components/common/Loading"

import PageComponent from "./page-component"

export default function Dashboard() {
  return (
    <>
      <PageComponent />
      <Loading className="h-60" />
    </>
  )
}
