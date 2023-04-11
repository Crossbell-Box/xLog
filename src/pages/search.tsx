import { GetServerSideProps } from "next"
import { ReactElement, useState } from "react"
import { MainLayout } from "~/components/main/MainLayout"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { prefetchGetSites } from "~/queries/site.server"
import showcase from "../../data/showcase.json"
import topics from "../../data/topics.json"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { languageDetector } from "~/lib/language-detector"
import { MainFeed } from "~/components/main/MainFeed"
import { MainSidebar } from "~/components/main/MainSidebar"
import { useRouter } from "next/router"
import { SearchInput } from "~/components/common/SearchInput"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  await prefetchGetSites(showcase, queryClient)

  return {
    props: {
      ...(await serverSideTranslations(languageDetector(ctx), [
        "common",
        "index",
        "dashboard",
      ])),
      dehydratedState: dehydrate(queryClient),
    },
  }
}

function Search() {
  const router = useRouter()
  const keyword = router.query.q as string

  return (
    <section className="pt-24">
      <div className="max-w-screen-lg px-5 mx-auto flex">
        <div className="flex-1 min-w-[300px]">
          <SearchInput value={keyword} />
          <div className="mt-10">
            <MainFeed type="search" keyword={keyword} />
          </div>
        </div>
        <MainSidebar hideSearch={true} />
      </div>
    </section>
  )
}

Search.getLayout = (page: ReactElement) => {
  return <MainLayout>{page}</MainLayout>
}

export default Search
