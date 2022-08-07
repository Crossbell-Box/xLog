import { Note } from "~/lib/types"
import { LikeIcon } from "~/components/icons/LikeIcon"
import {
  useLikePage,
  useUnlikePage,
  useMintPage,
  useGetLikes,
  useCheckLike,
  useGetMints,
  useCheckMint,
} from "~/queries/page"
import { useGetUserSites } from "~/queries/site"
import { useAccount } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { useRouter } from "next/router"
import { SITE_URL } from "~/lib/env"
import { DuplicateIcon } from "@heroicons/react/solid"

export const PostFooter: React.FC<{
  page?: Note
}> = ({ page }) => {
  const likePage = useLikePage()
  const unlikePage = useUnlikePage()
  const mintPage = useMintPage()

  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [likeProgress, setLikeProgress] = useState(false)
  const [mintProgress, setMintProgress] = useState(false)
  const userSite = useGetUserSites(address)
  const router = useRouter()

  const like = async () => {
    if (!address) {
      setLikeProgress(true)
      openConnectModal?.()
    } else if (!userSite.data) {
      router.push(`${SITE_URL}/dashboard/new-site`)
    } else if (page?.id) {
      if (isLike.data?.count) {
        // unlikePage.mutate({
        //   address,
        //   pageId: page?.id,
        // })
        // TODO
      } else {
        likePage.mutate({
          address,
          pageId: page?.id,
        })
      }
    }
  }

  const mint = async () => {
    if (!address) {
      setMintProgress(true)
      openConnectModal?.()
    } else if (!userSite.data) {
      router.push(`${SITE_URL}/dashboard/new-site`)
    } else if (page?.id) {
      if (isMint.data?.count) {
        // TODO
      } else {
        mintPage.mutate({
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

  const mints = useGetMints({
    pageId: page?.id,
  })
  const isMint = useCheckMint({
    address,
    pageId: page?.id,
  })

  useEffect(() => {
    if (mintProgress && address && isMint.isSuccess && page?.id) {
      if (!userSite.data) {
        router.push(`${SITE_URL}/dashboard/new-site`)
      }
      if (!isMint.data.count) {
        mintPage.mutate({
          address,
          pageId: page?.id,
        })
      }
      setMintProgress(false)
    }
  }, [
    userSite.data,
    router,
    mintProgress,
    address,
    isMint.isSuccess,
    isMint.data?.count,
    mintPage,
    page?.id,
  ])

  useEffect(() => {
    if (likeProgress && address && isLike.isSuccess && page?.id) {
      if (!userSite.data) {
        router.push(`${SITE_URL}/dashboard/new-site`)
      }
      if (!isLike.data.count) {
        likePage.mutate({
          address,
          pageId: page?.id,
        })
      }
      setLikeProgress(false)
    }
  }, [
    userSite.data,
    router,
    likeProgress,
    address,
    isLike.isSuccess,
    isLike.data?.count,
    likePage,
    page?.id,
  ])

  return (
    <div className="flex fill-gray-400 text-gray-500 mt-14">
      <Button
        variant="text"
        className="flex items-center mr-10"
        isAutoWidth={true}
        onClick={like}
        isLoading={
          userSite.isLoading ||
          likePage.isLoading ||
          unlikePage.isLoading ||
          likeProgress
        }
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
      <Button
        variant="text"
        className="flex items-center mr-10"
        isAutoWidth={true}
        onClick={mint}
        isLoading={mintPage.isLoading || likeProgress}
        style={
          isMint.isSuccess && isMint.data.count
            ? {
                color: "#FFCF55",
                fill: "#FFCF55",
              }
            : {}
        }
      >
        <DuplicateIcon className="mr-2 w-10 h-10" />
        <span>{mints.data?.count || 0}</span>
      </Button>
    </div>
  )
}
