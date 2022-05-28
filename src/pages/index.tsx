import { GetServerSideProps } from "next"
import { useEffect } from "react"
import { DashboardIcon } from "~/components/icons/DashboardIcon"
import { MainLayout } from "~/components/main/MainLayout"
import { UniLink } from "~/components/ui/UniLink"
import { getAuthUser } from "~/lib/auth.server"
import { FLY_REGION } from "~/lib/env.server"
import { useStore } from "~/lib/store"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = await getAuthUser(ctx.req)
  const isLoggedIn = !!user

  return {
    props: {
      isLoggedIn,
      region: FLY_REGION,
    },
  }
}

export default function Home({
  isLoggedIn,
  region,
}: {
  isLoggedIn: boolean
  region: string | null
}) {
  const setLoginModalOpened = useStore((store) => store.setLoginModalOpened)

  useEffect(() => {
    console.log("-> region", region)
  }, [region])

  return (
    <MainLayout isLoggedIn={isLoggedIn}>
      <section>
        <div className="max-w-screen-md px-5 mx-auto">
          <div className="bg-zinc-50 rounded-xl p-10">
            <h2 className="text-5xl font-extrabold">
              Content Creating for
              <br />
              Absolutely Everyone
            </h2>
            <h3 className="mt-5 text-zinc-500">
              Meet Proselog, the open-source blogging and
              <br />
              newsletter platform for everyone. Focus on writing, not
              distractions.
            </h3>
            <div className="mt-10">
              {isLoggedIn ? (
                <UniLink
                  href="/dashboard"
                  className="text-indigo-500 inline-flex items-center space-x-2 hover:text-indigo-600"
                >
                  <span className="i-bi-grid text-lg"></span>
                  <span>Dashboard</span>
                </UniLink>
              ) : (
                <UniLink
                  onClick={() => {
                    setLoginModalOpened(true)
                  }}
                  className="bg-indigo-500 hover:bg-indigo-600 rounded-full px-4 h-8 inline-flex items-center text-sm text-white font-medium"
                >
                  Getting Started
                </UniLink>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
