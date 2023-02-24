import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { PagesManager } from "~/components/dashboard/PagesManager"
import type { ReactElement } from "react"
import { useTranslation } from "next-i18next"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { GetServerSideProps } from "next"
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

export default function SubdomainPages() {
  return <PagesManager isPost={false} />
}

SubdomainPages.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Pages">{page}</DashboardLayout>
}
