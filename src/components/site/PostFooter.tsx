import { Note } from "~/lib/types"
import { LikeIcon } from "~/components/icons/LikeIcon"
import { CollectIcon } from "~/components/icons/CollectIcon"
import {
  useLikePage,
  useUnlikePage,
  useGetLikes,
  useCheckLike,
} from "~/queries/page"
import { useAccount } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useState, useEffect } from "react"
import { Button } from "../ui/Button"

export const PostFooter: React.FC<{
  page?: Note
}> = ({ page }) => {
  const likePage = useLikePage()
  const unlikePage = useUnlikePage()
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [likeProgress, setLikeProgress] = useState(false)

  const like = async () => {
    if (!address) {
      setLikeProgress(true)
      openConnectModal?.()
    } else if (page?.id) {
      if (isLike.data?.count) {
        unlikePage.mutate({
          address,
          pageId: page?.id,
        })
      } else {
        likePage.mutate({
          address,
          pageId: page?.id,
        })
      }
    }
  }

  const likes = useGetLikes({
    pageId: page?.id,
  })
  const isLike = useCheckLike({
    address,
    pageId: page?.id,
  })

  useEffect(() => {
    if (likeProgress && address && isLike.isSuccess && page?.id) {
      if (!isLike.data.count) {
        likePage.mutate({
          address,
          pageId: page?.id,
        })
      }
      setLikeProgress(false)
    }
  }, [
    likeProgress,
    address,
    isLike.isSuccess,
    isLike.data?.count,
    likePage,
    page?.id,
  ])

  return (
    <div className="flex fill-gray-400 text-gray-500 mt-10">
      <Button
        variant="text"
        className="flex items-center mr-10"
        isAutoWidth={true}
        onClick={like}
        isLoading={likePage.isLoading || unlikePage.isLoading || likeProgress}
        style={
          isLike.isSuccess && isLike.data.count
            ? {
                color: "#f91880",
                fill: "#f91880",
              }
            : {}
        }
      >
        <LikeIcon className="mr-2 w-10 h-10" />
        <span>{likes.data?.count || 0}</span>
      </Button>
      <Button variant="text" className="flex items-center" isAutoWidth={true}>
        <CollectIcon className="mr-2 w-10 h-10" />
        <span>0</span>
      </Button>
    </div>
  )
}
