import { GetServerSideProps } from "next"
import { MainLayout } from "~/components/main/MainLayout"
import { getAuthUser } from "~/lib/auth.server"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = await getAuthUser(ctx.req)
  const isLoggedIn = !!user
  return {
    props: {
      isLoggedIn,
    },
  }
}

export default function Home({ isLoggedIn }: { isLoggedIn: boolean }) {
  return <MainLayout isLoggedIn={isLoggedIn}>{""}</MainLayout>
}
