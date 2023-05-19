import React, { useEffect, useRef, useState } from "react"

import { ReactionLike } from "~/components/common/ReactionLike"
import { ReactionMint } from "~/components/common/ReactionMint"
import { ReactionTip } from "~/components/common/ReactionTip"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"
import { calculateElementTop } from "~/lib/utils"
import { useGetComments } from "~/queries/page"

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

  const comments = useGetComments({
    characterId: page?.characterId,
    noteId: page?.noteId,
  })

  return (
    <div
      className="xlog-post-actions absolute right-full pr-14 h-full top-0"
      style={{
        display: maxWidth > 60 ? "block" : "none",
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
        <div
          className="cursor-pointer text-gray-500 flex flex-col items-center leading-snug"
          onClick={() => {
            const targetElement = document.querySelector(
              "#comments",
            ) as HTMLElement
            window.scrollTo({
              top: calculateElementTop(targetElement) - 20,
              behavior: "smooth",
            })
          }}
        >
          <i className="icon-[mingcute--comment-fill] text-[33px]" />
          <span className="text-gray-500">
            {comments.data?.pages?.[0]?.count}
          </span>
        </div>
      </div>
    </div>
  )
}
