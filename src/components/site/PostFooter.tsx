"use client"

import { useInViewport } from "ahooks"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { ReactionLike } from "~/components/common/ReactionLike"
import { ReactionTip } from "~/components/common/ReactionTip"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"

import { ReactionShare } from "../common/ReactionShare"
import { Skeleton } from "../ui/Skeleton"

const key = ["PostFooterInView"]

const CommentSkeleton = () => (
  <div className="xlog-comment comment mb-10" id="comments" data-hide-print>
    <Skeleton.Container>
      <>
        <div className="xlog-comment-count border-b pb-2 mb-6">
          <Skeleton.Rectangle className="h-[19px] w-[46px]" />
        </div>
        <div className="xlog-comment-input flex">
          <Skeleton.Circle size={45} className="mr-3" />
          <div className="flex-1">
            <Skeleton.Rectangle className="mb-2 h-[74px] border border-[var(--border-color)] rounded-lg" />
            <div className="flex justify-between">
              <Skeleton.Circle size={24} className="px-2" />
              <Skeleton.Rectangle className="h-[36px] w-[100px] rounded-full" />
            </div>
          </div>
        </div>
      </>
    </Skeleton.Container>
  </div>
)

const DynamicComment = dynamic(() => import("~/components/common/Comment"), {
  loading: CommentSkeleton,
})

export const usePostFooterInView = () => {
  const { data } = useQuery<boolean>({
    queryKey: key,
    enabled: false,
  })
  return data
}
export const PostFooter = ({
  page,
  site,
  fixHeight,
}: {
  page?: ExpandedNote
  site?: ExpandedCharacter
  fixHeight?: boolean
}) => {
  const actionElRef = useRef<HTMLDivElement>(null)
  const [isInView] = useInViewport(actionElRef)

  const [inited, setInited] = useState(false)

  const queryClient = useQueryClient()
  useEffect(() => {
    queryClient.setQueryData(key, () => isInView)

    if (!inited && isInView) {
      setInited(true)
    }
  }, [isInView])

  return (
    <>
      <div
        ref={actionElRef}
        className="xlog-reactions flex fill-gray-400 text-gray-500 sm:items-center space-x-6 sm:space-x-10 mt-14 mb-12"
        data-hide-print
      >
        <ReactionLike characterId={page?.characterId} noteId={page?.noteId} />
        {/* <ReactionMint characterId={page?.characterId} noteId={page?.noteId} /> */}
        <ReactionTip
          characterId={page?.characterId}
          noteId={page?.noteId}
          site={site}
          page={page}
        />
        <ReactionShare noteId={page?.noteId} />
      </div>
      {inited || isInView ? (
        <DynamicComment page={page} fixHeight={fixHeight} className="mb-10" />
      ) : (
        <CommentSkeleton />
      )}
    </>
  )
}
