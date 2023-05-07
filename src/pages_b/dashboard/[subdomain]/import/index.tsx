import { GetServerSideProps } from "next"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import type { ReactElement } from "react"

import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { Image } from "~/components/ui/Image"
import { UniLink } from "~/components/ui/UniLink"
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
  const { t } = useTranslation("dashboard")

  const options = [
    {
      name: "Markdown files",
      path: "/markdown",
      icon: "markdown.svg",
    },
    {
      name: "Mirror.xyz",
      path: "/mirror",
      icon: "mirror.xyz.svg",
    },
  ]

  return (
    <DashboardMain title="Import">
      <div className="min-w-[270px] max-w-screen-lg flex flex-col space-y-4">
        {options.map((option) => (
          <UniLink
            className="prose p-6 bg-slate-100 rounded-lg relative flex items-center"
            key={option.name}
            href={router.asPath + option.path}
          >
            <span className="w-8 h-8 mr-4">
              <Image
                fill
                src={`/assets/${option.icon}`}
                alt={option.name}
              ></Image>
            </span>
            <span className="font-medium">
              {t(`Import from ${option.name}`)}
            </span>
          </UniLink>
        ))}
      </div>
    </DashboardMain>
  )
}

ImportPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Import">{page}</DashboardLayout>
}
