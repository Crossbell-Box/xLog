"use client"

import React, { useRef } from "react"

import { ReactionComment } from "~/components/common/ReactionComment"
import { ReactionLike } from "~/components/common/ReactionLike"
import { ReactionTip } from "~/components/common/ReactionTip"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"

import { ReactionShare } from "../common/ReactionShare"
import { usePostFooterInView } from "./PostFooter"

const PostActions = ({
  page,
  site,
}: {
  page?: ExpandedNote
  site?: ExpandedCharacter
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const isPostFooterInView = usePostFooterInView()

  return (
    <div
      className="xlog-post-actions absolute right-full pr-14 h-full top-0 transition-[visibility,opacity] lg:block hidden"
      style={{
        opacity: isPostFooterInView ? 0 : 1,
        visibility: isPostFooterInView ? "hidden" : "visible",
      }}
      ref={containerRef}
    >
      <div className="sticky top-[calc(100vh-290px)] text-sm leading-loose whitespace-nowrap flex flex-col justify-center items-center space-y-4">
        <ReactionLike
          characterId={page?.characterId}
          noteId={page?.noteId}
          vertical={true}
        />
        {/* <ReactionMint
          characterId={page?.characterId}
          noteId={page?.noteId}
          vertical={true}
        /> */}
        <ReactionTip
          characterId={page?.characterId}
          noteId={page?.noteId}
          site={site}
          page={page}
          vertical={true}
        />
        <ReactionComment
          characterId={page?.characterId}
          noteId={page?.noteId}
        />
        <ReactionShare noteId={page?.noteId} vertical />
      </div>
    </div>
  )
}

export default PostActions
