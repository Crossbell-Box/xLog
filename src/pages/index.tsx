import { GetServerSideProps } from "next"
import { MainLayout } from "~/components/main/MainLayout"
import { getAuthUser } from "~/lib/auth.server"
import { FLY_REGION } from "~/lib/env.server"

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
  return <MainLayout isLoggedIn={isLoggedIn} region={region}></MainLayout>
}
