import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { UniLink } from "~/components/ui/UniLink"
import type { ReactElement } from "react"
import { useGetSite, useGetStat } from "~/queries/site"
import { useTranslation, Trans } from "next-i18next"
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

export default function ImportPage() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string
  const site = useGetSite(subdomain)
  const characterId = site.data?.metadata?.proof
  const { t } = useTranslation("dashboard")

  const options = [
    {
      name: "Markdown files",
      path: "/markdown",
    },
    {
      name: "Mirror.xyz",
      path: "/mirror",
    },
  ]

  return (
    <DashboardMain title="Import">
      <div className="min-w-[270px] max-w-screen-lg flex flex-col space-y-4">
        {options.map((option) => (
          <UniLink
            className="prose p-6 bg-slate-100 rounded-lg relative"
            key={option.name}
            href={router.asPath + option.path}
          >
            Import from {option.name}
          </UniLink>
        ))}
      </div>
    </DashboardMain>
  )
}

ImportPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Import">{page}</DashboardLayout>
}
