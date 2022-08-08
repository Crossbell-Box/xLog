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
import { Comment } from "~/components/common/Comment"
import { UniLink } from "~/components/ui/UniLink"
import { Modal } from "~/components/ui/Modal"

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
  let [isLikeOpen, setIsLikeOpen] = useState(false)
  let [isMintOpen, setIsMintOpen] = useState(false)

  function closeLikeModal() {
    setIsLikeOpen(false)
  }

  function openLikeModal() {
    setIsLikeOpen(true)
  }

  function closeMintModal() {
    setIsMintOpen(false)
  }

  function openMintModal() {
    setIsMintOpen(true)
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

  const like = async () => {
    if (!address) {
      setLikeProgress(true)
      openConnectModal?.()
    } else if (!userSite.data) {
      router.push(`${SITE_URL}/dashboard/new-site`)
    } else if (page?.id) {
      if (isLike.data?.count) {
        openLikeModal()
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
        openMintModal()
      } else {
        mintPage.mutate({
          address,
          pageId: page?.id,
        })
      }
    }
  }

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
    <>
      <div className="flex fill-gray-400 text-gray-500 mt-14 mb-12">
        <Button
          variant="like"
          className={`flex items-center mr-10 ${
            isLike.isSuccess && isLike.data.count && "active"
          }`}
          isAutoWidth={true}
          onClick={like}
          isLoading={
            userSite.isLoading ||
            likePage.isLoading ||
            unlikePage.isLoading ||
            likeProgress
          }
        >
          <LikeIcon className="mr-2 w-10 h-10" />
          <span>{likes.data?.count || 0}</span>
        </Button>
        <Button
          variant="collect"
          className={`flex items-center mr-10 ${
            isMint.isSuccess && isMint.data.count && "active"
          }`}
          isAutoWidth={true}
          onClick={mint}
          isLoading={mintPage.isLoading || likeProgress}
        >
          <DuplicateIcon className="mr-2 w-10 h-10" />
          <span>{mints.data?.count || 0}</span>
        </Button>
        <Modal
          open={isLikeOpen}
          setOpen={closeLikeModal}
          title="Like successfull"
        >
          <div className="p-5">
            Your like has been permanently stored on the blockchain, view them{" "}
            <UniLink
              className="text-indigo-600"
              href={`https://scan.crossbell.io/tx/${isLike.data?.list?.[0]?.transactionHash}`}
            >
              here
            </UniLink>
          </div>
          <div className="h-16 border-t flex items-center px-5">
            <Button isBlock onClick={closeLikeModal}>
              Got it, thanks!
            </Button>
          </div>
        </Modal>
        <Modal
          open={isMintOpen}
          setOpen={closeMintModal}
          title="Mint successfull"
        >
          <div className="p-5">
            Your minting has been permanently stored on the blockchain, view
            them{" "}
            <UniLink
              className="text-indigo-600"
              href={`https://scan.crossbell.io/tx/${isMint.data?.list?.[0]?.transactionHash}`}
            >
              here
            </UniLink>
          </div>
          <div className="h-16 border-t flex items-center px-5">
            <Button isBlock onClick={closeMintModal}>
              Got it, thanks!
            </Button>
          </div>
        </Modal>
      </div>
      <Comment page={page} />
    </>
  )
}
