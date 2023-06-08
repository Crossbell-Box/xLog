"use client"

import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { memo, useEffect, useState } from "react"
import reactStringReplace from "react-string-replace"
import { Virtuoso } from "react-virtuoso"

import { useAccountState, useConnectModal } from "@crossbell/connect-kit"
import { Switch } from "@headlessui/react"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { Titles } from "~/components/common/Titles"
import PostCover from "~/components/site/PostCover"
import { Image } from "~/components/ui/Image"
import { Tabs } from "~/components/ui/Tabs"
import { Tooltip } from "~/components/ui/Tooltip"
import { useDate } from "~/hooks/useDate"
import { useTranslation } from "~/lib/i18n/client"
import { getStorage, setStorage } from "~/lib/storage"
import { ExpandedNote } from "~/lib/types"
import { cn, getStringLength } from "~/lib/utils"
import type { FeedType, SearchType } from "~/models/home.model"
import { useGetFeed } from "~/queries/home"

import topics from "../../../data/topics.json"
import { EmptyState } from "../ui/EmptyState"
import { Skeleton } from "../ui/Skeleton"

const PostCard = ({
  post,
  simple,
  isComment,
  keyword,
}: {
  post: ExpandedNote
  simple?: boolean
  isComment?: boolean
  keyword?: string
}) => {
  const router = useRouter()

  return (
    <Link
      target="_blank"
      href={`/api/redirection?characterId=${post.characterId}&noteId=${post.noteId}`}
      className={cn(
        "xlog-post sm:hover:bg-hover transition-all p-4 ml-10 sm:rounded-xl flex flex-col sm:flex-row items-center hover:opacity-100 group",
        simple && "opacity-90",
        isComment ? "bg-zinc-50" : "bg-white",
      )}
      prefetch={false}
    >
      {!simple && <PostCover cover={post.metadata?.content.cover} />}
      <div className="flex-1 flex justify-center flex-col w-full min-w-0">
        <h3
          className={cn(
            "xlog-post-title font-bold text-zinc-700 line-clamp-2",
            simple ? "text-xl" : "text-2xl",
          )}
        >
          {post.metadata?.content?.title}
        </h3>
        {!simple && (
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
        )}
        <div
          className={cn(
            "xlog-post-excerpt mt-3 text-zinc-500",
            simple ? "line-clamp-1" : "line-clamp-2",
          )}
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
    </Link>
  )
}

const Post = ({
  post,
  previousPost,
  filtering,
  keyword,
}: {
  post: ExpandedNote
  previousPost?: ExpandedNote
  filtering: number
  keyword?: string
}) => {
  const { t } = useTranslation("common")
  const date = useDate()
  let simple = post.characterId === previousPost?.characterId

  if (
    filtering &&
    post.metadata?.content?.score?.number !== undefined &&
    post.metadata.content.score.number <= filtering
  ) {
    return null
  }

  let isComment
  if (post.metadata?.content?.tags?.includes("comment") && post.toNote) {
    isComment = true
    if (post.toNote?.metadata?.content?.tags?.includes("comment")) {
      return null
    }
    if (
      !post.metadata?.content?.summary ||
      getStringLength(post.metadata.content.summary) < 6
    ) {
      return null
    }
  }

  return (
    <div className={cn(simple ? "!mt-4" : "")}>
      {!simple && (
        <div className="flex items-center space-x-2">
          <CharacterFloatCard siteId={post.character?.handle}>
            <Link
              target="_blank"
              href={`/api/redirection?characterId=${post.characterId}`}
              className="flex items-center space-x-4 cursor-pointer"
              prefetch={false}
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
      )}
      {isComment && (
        <Link
          target="_blank"
          href={`/api/redirection?characterId=${post.characterId}&noteId=${post.noteId}`}
          className="block p-4 ml-10 font-medium text-zinc-700"
        >
          <i className="icon-[mingcute--comment-fill] align-middle mr-2" />
          <span className="align-middle">
            {post.metadata?.content?.summary}
          </span>
        </Link>
      )}
      <PostCard
        post={isComment ? (post.toNote as ExpandedNote) : post}
        simple={simple || isComment}
        isComment={isComment}
        keyword={keyword}
      />
    </div>
  )
}

const MemoedPost = memo(Post)

export const HomeFeed = ({
  noteIds,
  type,
}: {
  noteIds?: string[]
  type?: FeedType
}) => {
  const { t } = useTranslation("common")
  const searchParams = useSearchParams()

  const currentCharacterId = useAccountState(
    (s) => s.computed.account?.characterId,
  )

  const connectModal = useConnectModal()
  if (type === "following" && !currentCharacterId) {
    connectModal.show()
  }

  const [hotInterval, setHotInterval] = useState(7)
  const [searchType, setSearchType] = useState<SearchType>("latest")

  const params = useParams()
  if (params.topic) {
    params.topic = decodeURIComponent(params.topic)
  }

  const feed = useGetFeed({
    type,
    characterId: currentCharacterId,
    noteIds: noteIds,
    daysInterval: hotInterval,
    searchKeyword: searchParams?.get("q") || undefined,
    searchType,
    tag: decodeURIComponent(params?.tag),
    topicIncludeKeywords: params.topic
      ? topics.find((t) => t.name === params.topic)?.includeKeywords
      : undefined,
  })

  const hasFiltering = type === "latest"

  const [aiFiltering, setAiFiltering] = useState(true)

  useEffect(() => {
    setAiFiltering(getStorage("ai_filtering")?.enabled ?? true)
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
      onClick: () => setSearchType("hottest"),
      active: searchType === "hottest",
    },
  ]

  return (
    <>
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
        {type === "hottest" && (
          <Tabs items={hotTabs} className="border-none text-sm -my-4"></Tabs>
        )}
        {type === "search" && (
          <Tabs items={searchTabs} className="border-none text-sm -my-4"></Tabs>
        )}

        {feed.isLoading ? (
          <FeedSkeleton />
        ) : !feed.data?.pages[0]?.count ? (
          <EmptyState />
        ) : (
          <div className="xlog-posts my-8">
            <Virtuoso
              overscan={5}
              endReached={() => feed.hasNextPage && feed.fetchNextPage()}
              useWindowScroll
              data={feed.data?.pages}
              itemContent={(_, posts) => {
                if (!posts?.list.length) return <div className="h-[1px]"></div>
                return (
                  <div className="space-y-8 mb-8">
                    {posts?.list.map((post, index, array) => {
                      return (
                        <MemoedPost
                          key={`${post.characterId}-${post.noteId}`}
                          post={post}
                          previousPost={
                            (type === "latest" || type === "topic") &&
                            index >= 1
                              ? array[index - 1]
                              : undefined
                          }
                          filtering={aiFiltering ? 60 : 0}
                          keyword={searchParams?.get("q") || undefined}
                        />
                      )
                    })}
                  </div>
                )
              }}
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

const FeedSkeleton = () => {
  return (
    <Skeleton.Container count={5} className="space-y-8">
      <div>
        <div className="flex space-x-2 items-center">
          <Skeleton.Circle size={40} />
          <Skeleton.Rectangle className="w-1/3" />
        </div>
        <div className="py-4 pr-4 ml-12">
          <Skeleton.Rectangle className="w-full h-24" />
        </div>
      </div>
    </Skeleton.Container>
  )
}
