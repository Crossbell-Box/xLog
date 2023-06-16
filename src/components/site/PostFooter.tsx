"use client"

import { useInViewport } from "ahooks"
import dynamic from "next/dynamic"
import { useEffect, useRef } from "react"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { ReactionLike } from "~/components/common/ReactionLike"
import { ReactionTip } from "~/components/common/ReactionTip"
import { useTranslation } from "~/lib/i18n/client"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"

const key = ["PostFooterInView"]

const DynamicComment = dynamic(() => import("~/components/common/Comment"), {
  // TODO Skeleton
  loading: () => <p>Loading comments...</p>,
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
}: {
  page?: ExpandedNote
  site?: ExpandedCharacter
}) => {
  const actionElRef = useRef<HTMLDivElement>(null)
  const [isInView] = useInViewport(actionElRef)

  const queryClient = useQueryClient()
  useEffect(() => {
    queryClient.setQueryData(key, () => isInView)
  }, [isInView])

  const { t } = useTranslation("common")

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
      </div>
      <DynamicComment page={page} />
    </>
  )
}
