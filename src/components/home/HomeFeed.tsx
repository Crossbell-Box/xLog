"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { memo, useEffect, useState } from "react"
import reactStringReplace from "react-string-replace"
import { Virtuoso } from "react-virtuoso"

import { useAccountState, useConnectModal } from "@crossbell/connect-kit"
import { Switch } from "@headlessui/react"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { Titles } from "~/components/common/Titles"
import { Image } from "~/components/ui/Image"
import { Tabs } from "~/components/ui/Tabs"
import { Tooltip } from "~/components/ui/Tooltip"
import { useDate } from "~/hooks/useDate"
import { useTranslation } from "~/lib/i18n/client"
import { getStorage, setStorage } from "~/lib/storage"
import { ExpandedNote } from "~/lib/types"
import type { FeedType, SearchType } from "~/models/home.model"
import { useGetFeed } from "~/queries/home"

import { EmptyState } from "../ui/EmptyState"

const Post = ({
  post,
  filtering,
  keyword,
}: {
  post: ExpandedNote
  filtering: number
  keyword?: string
}) => {
  const router = useRouter()
  const { t } = useTranslation("common")
  const date = useDate()

  if (
    filtering &&
    post.metadata?.content?.score?.number !== undefined &&
    post.metadata.content.score.number <= filtering
  ) {
    return <div></div>
  }

  return (
    <div className="mt-8">
      <div className="flex items-center space-x-2">
        <CharacterFloatCard siteId={post.character?.handle}>
          <Link
            target="_blank"
            href={`/api/redirection?characterId=${post.characterId}`}
            className="flex items-center space-x-4 cursor-pointer"
          >
            <span className="w-10 h-10 inline-block">
              <Image
                className="rounded-full"
                src={
                  post.character?.metadata?.content?.avatars?.[0] ||
                  "ipfs://bafkreiabgixxp63pg64moxnsydz7hewmpdkxxi3kdsa4oqv4pb6qvwnmxa"
                }
                alt={post.character?.handle || ""}
                width="40"
                height="40"
              ></Image>
            </span>
            <span className="font-medium">
              {post.character?.metadata?.content?.name ||
                post.character?.handle}
            </span>
          </Link>
        </CharacterFloatCard>
        <Titles characterId={post.characterId} />
        <span className="text-zinc-400">·</span>
        <time
          dateTime={date.formatToISO(post.createdAt)}
          className="xlog-post-date whitespace-nowrap text-zinc-400 text-sm"
        >
          {t("ago", {
            time: date.dayjs
              .duration(
                date.dayjs(post?.createdAt).diff(date.dayjs(), "minute"),
                "minute",
              )
              .humanize(),
          })}
        </time>
      </div>
      <Link
        target="_blank"
        href={`/api/redirection?characterId=${post.characterId}&noteId=${post.noteId}`}
        className="xlog-post sm:hover:bg-hover bg-white transition-all p-4 ml-10 sm:rounded-xl flex flex-col sm:flex-row items-center"
      >
        <div className="flex-1 flex justify-center flex-col w-full min-w-0">
          <h3 className="xlog-post-title text-2xl font-bold text-zinc-700">
            {post.metadata?.content?.title}
          </h3>
          <div className="xlog-post-meta text-sm text-zinc-400 mt-1 space-x-4 flex items-center mr-8">
            {!!post.metadata?.content?.tags?.filter(
              (tag) => tag !== "post" && tag !== "page",
            ).length && (
              <span className="xlog-post-tags space-x-1 truncate min-w-0">
                {post.metadata?.content?.tags
                  ?.filter((tag) => tag !== "post" && tag !== "page")
                  .map((tag, index) => (
                    <span
                      className="hover:text-zinc-600"
                      key={tag + index}
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/tag/${tag}`)
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
              </span>
            )}
            {post.stat?.viewDetailCount && (
              <span className="xlog-post-views inline-flex items-center">
                <i className="icon-[mingcute--eye-line] mr-[2px]" />
                <span>{post.stat?.viewDetailCount}</span>
              </span>
            )}
          </div>
          <div
            className="xlog-post-excerpt mt-3 text-zinc-500 line-clamp-2"
            style={{
              wordBreak: "break-word",
            }}
          >
            {keyword
              ? reactStringReplace(
                  post.metadata?.content?.summary || "",
                  keyword,
                  (match, i) => (
                    <span key={i} className="bg-yellow-200">
                      {match}
                    </span>
                  ),
                )
              : post.metadata?.content?.summary}
            {post.metadata?.content?.summary && "..."}
          </div>
        </div>
        {post.metadata?.content.cover && (
          <div className="xlog-post-cover flex items-center relative w-full sm:w-24 h-40 sm:h-24 mt-2 sm:ml-4 sm:mt-0">
            <Image
              className="object-cover rounded"
              alt="cover"
              fill={true}
              src={post.metadata?.content.cover}
            ></Image>
          </div>
        )}
      </Link>
    </div>
  )
}

const MemoedPost = memo(Post)

export const HomeFeed: React.FC<{
  noteIds?: string[]
  keyword?: string
}> = ({ noteIds, keyword }) => {
  const { t } = useTranslation("common")

  const [feedType, setFeedType] = useState<FeedType>("latest")

  const currentCharacterId = useAccountState(
    (s) => s.computed.account?.characterId,
  )

  const [hotInterval, setHotInterval] = useState(7)
  const [searchType, setSearchType] = useState<SearchType>("latest")

  const feed = useGetFeed({
    type: feedType,
    characterId: currentCharacterId,
    noteIds: noteIds,
    daysInterval: hotInterval,
    searchKeyword: keyword,
    searchType,
  })

  const hasFiltering = feedType === "latest"

  const [aiFiltering, setAiFiltering] = useState(true)

  useEffect(() => {
    setAiFiltering(getStorage("ai_filtering")?.enabled || true)
  }, [])

  const hotTabs = [
    {
      text: "Today",
      onClick: () => setHotInterval(1),
      active: hotInterval === 1,
    },
    {
      text: "This week",
      onClick: () => setHotInterval(7),
      active: hotInterval === 7,
    },
    {
      text: "This month",
      onClick: () => setHotInterval(30),
      active: hotInterval === 30,
    },
    {
      text: "All time",
      onClick: () => setHotInterval(0),
      active: hotInterval === 0,
    },
  ]

  const searchTabs = [
    {
      text: "Latest",
      onClick: () => setSearchType("latest"),
      active: searchType === "latest",
    },
    {
      text: "Hottest",
      onClick: () => setSearchType("hot"),
      active: searchType === "hot",
    },
  ]

  const connectModal = useConnectModal()

  const tabs = [
    {
      text: "Latest",
      onClick: () => setFeedType("latest"),
      active: feedType === "latest",
    },
    {
      text: "Hottest",
      onClick: () => setFeedType("hot"),
      active: feedType === "hot",
    },
    {
      text: "Following",
      onClick: () => {
        if (!currentCharacterId) {
          connectModal.show()
        } else {
          setFeedType("following")
        }
      },
      active: feedType === "following",
    },
  ]

  return (
    <>
      <Tabs items={tabs} className="border-none text-lg"></Tabs>
      <div className="space-y-10">
        {hasFiltering && (
          <div className="flex items-center text-zinc-500">
            <i className="icon-[mingcute--android-2-line] mr-2 text-lg" />
            <span className="mr-1 cursor-default">
              {t("Enable AI Filtering")}
            </span>
            <Tooltip
              label={t(
                "Filter out possible low-quality content based on AI ratings.",
              )}
            >
              <i className="icon-[mingcute--question-line]" />
            </Tooltip>
            <Switch
              checked={aiFiltering}
              onChange={(value) => {
                setAiFiltering(value)
                setStorage("ai_filtering", {
                  enabled: value,
                })
              }}
              className={`${
                aiFiltering ? "bg-accent" : "bg-gray-200"
              } ml-5 relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span className="sr-only">Enable AI Filtering</span>
              <span
                className={`${
                  aiFiltering ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>
          </div>
        )}
        {feedType === "hot" && (
          <Tabs items={hotTabs} className="border-none text-sm -my-4"></Tabs>
        )}
        {feedType === "search" && (
          <Tabs items={searchTabs} className="border-none text-sm -my-4"></Tabs>
        )}

        {feed.isLoading ? (
          <div className="text-center text-zinc-600">{t("Loading")}...</div>
        ) : !feed.data?.pages[0]?.count ? (
          <EmptyState />
        ) : (
          <div className="xlog-posts !-mt-0">
            <Virtuoso
              overscan={5}
              endReached={() => feed.hasNextPage && feed.fetchNextPage()}
              useWindowScroll
              data={feed.data?.pages}
              itemContent={(_, posts) =>
                posts?.list.map((post) => {
                  return (
                    <MemoedPost
                      key={`${post.characterId}-${post.noteId}`}
                      post={post}
                      filtering={aiFiltering ? 60 : 0}
                      keyword={keyword}
                    />
                  )
                })
              }
            ></Virtuoso>

            {feed.isFetching && feed.hasNextPage && <Loader />}
          </div>
        )}
      </div>
    </>
  )
}

const Loader = () => {
  const { t } = useTranslation("common")
  return (
    <div
      className="relative w-full text-sm text-center py-4 mt-12"
      key={"loading"}
    >
      {t("Loading")} ...
    </div>
  )
}
