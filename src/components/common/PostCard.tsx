"use client"

import { CharacterEntity } from "crossbell"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { memo } from "react"
import reactStringReplace from "react-string-replace"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { Titles } from "~/components/common/Titles"
import PostCover from "~/components/home/PostCover"
import { Avatar } from "~/components/ui/Avatar"
import { useDate } from "~/hooks/useDate"
import { getSiteLink } from "~/lib/helpers"
import { useTranslation } from "~/lib/i18n/client"
import { ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"

const Card = ({
  character,
  post,
  keyword,
  comment,
  createdAt,
  isPinned,
  linkPrefix,
  isBlank,
  showPublishTime,
}: {
  character?: CharacterEntity
  post: ExpandedNote
  keyword?: string
  comment?: string
  createdAt?: string
  isPinned?: boolean
  linkPrefix?: string
  isBlank?: boolean
  showPublishTime?: boolean
}) => {
  const router = useRouter()
  const { t } = useTranslation("common")
  const date = useDate()

  return (
    <Link
      target={isBlank ? "_blank" : undefined}
      href={`${linkPrefix || ""}/${post.metadata?.content?.slug}`}
      className={cn(
        "xlog-post sm:hover:bg-hover transition-all rounded-2xl flex flex-col items-center hover:opacity-100 group border relative",
      )}
    >
      <PostCover
        uniqueKey={`${post.characterId}-${post.noteId}`}
        images={post.metadata?.content.images}
        title={post.metadata?.content?.title}
      />
      <div className="px-3 py-2 sm:px-5 sm:py-4 w-full min-w-0 h-[148px] sm:h-[166px] flex flex-col space-y-2 text-sm">
        <div className="line-clamp-3 space-y-2 h-[76px]">
          {comment && (
            <div className="font-medium text-zinc-700 line-clamp-2">
              <i className="icon-[mingcute--comment-fill] mr-2" />
              {comment}
            </div>
          )}
          {!!post.metadata?.content.images?.length && (
            <h2
              className={cn(
                "xlog-post-title font-bold text-base",
                comment ? "text-zinc-500" : "text-zinc-700",
              )}
            >
              {post.metadata?.content?.title}
            </h2>
          )}
          {!comment && (
            <div
              className="xlog-post-excerpt text-zinc-500 line-clamp-3"
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
          )}
        </div>
        <div className="xlog-post-meta text-zinc-400 flex items-center text-[13px] h-[26px] truncate">
          {!!post.metadata?.content?.tags?.[1] && (
            <span
              className="xlog-post-tags hover:text-zinc-600 hover:bg-zinc-200 border transition-colors text-zinc-500 inline-flex items-center bg-zinc-100 rounded-full px-2 py-[1.5px] truncate text-xs sm:text-[13px] mr-2"
              onClick={(e) => {
                e.preventDefault()
                router.push(`/tag/${post.metadata?.content?.tags?.[1]}`)
              }}
            >
              <i className="icon-[mingcute--tag-line] mr-[2px]" />
              {post.metadata?.content?.tags?.[1]}
            </span>
          )}
          <span className="xlog-post-word-count sm:inline-flex items-center hidden mr-2">
            <i className="icon-[mingcute--time-line] mr-[2px]" />
            <span
              style={{
                wordSpacing: "-.2ch",
              }}
            >
              {post.metadata?.content?.readingTime} {t("min")}
            </span>
          </span>
          {!!post.stat?.viewDetailCount && (
            <span className="xlog-post-views inline-flex items-center">
              <i className="icon-[mingcute--eye-line] mr-[2px]" />
              <span>{post.stat?.viewDetailCount}</span>
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-xs sm:text-sm overflow-hidden">
          {character && (
            <>
              <CharacterFloatCard siteId={character?.handle}>
                <span
                  className="flex items-center cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(
                      `${getSiteLink({
                        subdomain: character?.handle || "",
                      })}`,
                    )
                  }}
                >
                  <span className="w-5 h-5 inline-block mr-[6px]">
                    <Avatar
                      cid={character?.characterId}
                      images={character?.metadata?.content?.avatars || []}
                      size={20}
                      name={character?.metadata?.content?.name}
                    ></Avatar>
                  </span>
                  <span className="font-medium truncate text-zinc-600">
                    {character?.metadata?.content?.name || character?.handle}
                  </span>
                </span>
              </CharacterFloatCard>
              <Titles characterId={+character?.characterId} />
              <span className="text-zinc-400 hidden sm:inline-block">·</span>
            </>
          )}
          <time
            dateTime={date.formatToISO(
              (showPublishTime && post.metadata?.content?.date_published) ||
                createdAt ||
                post.createdAt,
            )}
            className="xlog-post-date whitespace-nowrap text-zinc-400 hidden sm:inline-block"
          >
            {t("ago", {
              time: date.dayjs
                .duration(
                  date
                    .dayjs(
                      (showPublishTime &&
                        post.metadata?.content?.date_published) ||
                        createdAt ||
                        post.createdAt,
                    )
                    .diff(date.dayjs(), "minute"),
                  "minute",
                )
                .humanize(),
            })}
          </time>
        </div>
      </div>
      {isPinned && (
        <span className="absolute top-2 right-2 text-xs border transition-colors text-zinc-500 inline-flex items-center bg-zinc-100 rounded-full px-2 py-[1.5px]">
          <i className="icon-[mingcute--pin-2-fill] mr-1" />
          {t("Pinned")}
        </span>
      )}
    </Link>
  )
}

const Post = ({
  post,
  keyword,
  isPinned,
  linkPrefix,
  isBlank,
  showPublishTime,
}: {
  post: ExpandedNote
  keyword?: string
  isPinned?: boolean
  linkPrefix?: string
  isBlank?: boolean
  showPublishTime?: boolean
}) => {
  let isComment
  if (post.metadata?.content?.tags?.includes("comment") && post.toNote) {
    isComment = true
  }

  return (
    <Card
      character={post.character || undefined}
      post={isComment ? (post.toNote as ExpandedNote) : post}
      keyword={keyword}
      comment={isComment ? post.metadata?.content?.summary : undefined}
      createdAt={isComment ? post?.createdAt : post.toNote?.createdAt}
      isPinned={isPinned}
      linkPrefix={linkPrefix}
      isBlank={isBlank}
      showPublishTime={showPublishTime}
    />
  )
}

const PostCard = memo(Post)

export default PostCard
