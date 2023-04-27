import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { useRouter } from "next/router"
import { ReactElement } from "react"

import { QueryClient, dehydrate } from "@tanstack/react-query"

import { MainFeed } from "~/components/main/MainFeed"
import { MainLayout } from "~/components/main/MainLayout"
import { MainSidebar } from "~/components/main/MainSidebar"
import { languageDetector } from "~/lib/language-detector"
import { prefetchGetSites } from "~/queries/site.server"

import topics from "../../../data/topics.json"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  await prefetchGetSites(queryClient)

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

function Topic() {
  const router = useRouter()
  const topic = router.query.topic as string

  const info = topics.find((t) => t.name === topic)

  return (
    <section className="pt-24">
      <div className="max-w-screen-lg px-5 mx-auto flex">
        <div className="flex-1 min-w-[300px]">
          <h2 className="text-3xl font-bold">Topic: {topic}</h2>
          <p className="text-zinc-400 mt-4">{info?.description}</p>
          <div className="mt-10">
            <MainFeed type="topic" noteIds={info?.notes} />
          </div>
        </div>
        <MainSidebar />
      </div>
    </section>
  )
}

Topic.getLayout = (page: ReactElement) => {
  return <MainLayout>{page}</MainLayout>
}

export default Topic
