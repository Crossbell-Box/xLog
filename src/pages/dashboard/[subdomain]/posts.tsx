import { GetServerSideProps } from "next"
import type { ReactElement } from "react"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { PagesManager } from "~/components/dashboard/PagesManager"
import { serverSidePropsHandler } from "~/lib/server-side-props"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const { props: layoutProps } = await getLayoutServerSideProps(ctx)

    return {
      props: {
        ...layoutProps,
      },
    }
  },
)

export default function SubdomainPosts() {
  return <PagesManager isPost={true} />
}

SubdomainPosts.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Posts">{page}</DashboardLayout>
}
