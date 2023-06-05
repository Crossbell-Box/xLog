"use client"

import React, { useEffect, useRef, useState } from "react"

import { ReactionComment } from "~/components/common/ReactionComment"
import { ReactionLike } from "~/components/common/ReactionLike"
import { ReactionMint } from "~/components/common/ReactionMint"
import { ReactionTip } from "~/components/common/ReactionTip"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"

import { usePostFooterInView } from "./PostFooter"

export const PostActions: React.FC<{
  page?: ExpandedNote
  site?: ExpandedCharacter
}> = ({ page, site }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [maxWidth, setMaxWidth] = useState(0)
  useEffect(() => {
    if (containerRef?.current) {
      setMaxWidth(
        (window.innerWidth -
          (containerRef.current?.parentElement?.clientWidth || 0)) /
          2 -
          40,
      )
    }
  }, [containerRef])
  const isPostFooterInView = usePostFooterInView()

  return (
    <div
      className="xlog-post-actions absolute right-full pr-14 h-full top-0 transition-all duration-1000"
      style={{
        display: maxWidth > 60 ? "block" : "none",
        opacity: isPostFooterInView ? 0 : 1,
        visibility: isPostFooterInView ? "hidden" : "visible",
      }}
      ref={containerRef}
    >
      <div className="sticky top-[calc(100vh-313px)] text-sm leading-loose whitespace-nowrap flex flex-col justify-center items-center space-y-4">
        <ReactionLike
          characterId={page?.characterId}
          noteId={page?.noteId}
          vertical={true}
        />
        <ReactionMint
          characterId={page?.characterId}
          noteId={page?.noteId}
          vertical={true}
        />
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
      </div>
    </div>
  )
}
