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
import { SITE_URL, CSB_SCAN, CSB_IO } from "~/lib/env"
import { DuplicateIcon } from "@heroicons/react/solid"
import { Comment } from "~/components/common/Comment"
import { UniLink } from "~/components/ui/UniLink"
import { Modal } from "~/components/ui/Modal"
import { Avatar } from "../ui/Avatar"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { MintIcon } from "~/components/icons/MintIcon"

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
  let [isLikeListOpen, setIsLikeListOpen] = useState(false)
  let [isMintListOpen, setIsMintListOpen] = useState(false)

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
        setIsLikeOpen(true)
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
        setIsMintOpen(true)
      } else {
        mintPage.mutate({
          address,
          pageId: page?.id,
        })
      }
    }
  }

  useEffect(() => {
    if (
      mintProgress &&
      address &&
      isMint.isSuccess &&
      page?.id &&
      userSite.isSuccess
    ) {
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
    userSite.isSuccess,
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
    if (
      likeProgress &&
      address &&
      isLike.isSuccess &&
      page?.id &&
      userSite.isSuccess
    ) {
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
    userSite.isSuccess,
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
      <div className="xlog-post-footer flex fill-gray-400 text-gray-500 mt-14 mb-12 items-center">
        <div className="xlog-post-like flex items-center">
          <Button
            variant="like"
            className={`flex items-center mr-2 ${
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
            <LikeIcon className="mr-1 w-10 h-10" />
            <span>{likes.data?.count || 0}</span>
          </Button>
          <ul
            className="-space-x-4 mr-10 cursor-pointer"
            onClick={() => setIsLikeListOpen(true)}
          >
            {likes.data?.list
              ?.sort((a, b) =>
                b.fromCharacter?.metadata?.content?.avatars ? 1 : -1,
              )
              .slice(0, 3)
              ?.map((like: any, index) => (
                <li className="inline-block" key={index}>
                  <Avatar
                    className="align-middle border-2 border-white"
                    images={
                      like.fromCharacter?.metadata?.content?.avatars || []
                    }
                    name={like.fromCharacter?.metadata?.content?.name}
                    size={40}
                  />
                </li>
              ))}
            {(likes.data?.count || 0) > 3 && (
              <li className="inline-block">
                <div className="align-middle border-2 border-white w-10 h-10 rounded-full inline-flex bg-gray-100 items-center justify-center text-gray-400 font-medium">
                  +{likes.data!.count - 3}
                </div>
              </li>
            )}
          </ul>
        </div>
        <div className="xlog-post-mint flex items-center">
          <Button
            variant="collect"
            className={`flex items-center mr-2 ${
              isMint.isSuccess && isMint.data.count && "active"
            }`}
            isAutoWidth={true}
            onClick={mint}
            isLoading={mintPage.isLoading || likeProgress}
          >
            <MintIcon className="mr-2 w-8 h-8" />
            <span>{mints.data?.count || 0}</span>
          </Button>
          <ul
            className="-space-x-4 cursor-pointer"
            onClick={() => setIsMintListOpen(true)}
          >
            {mints.data?.list
              ?.sort((a, b: any) =>
                b.character?.metadata?.content?.avatars ? 1 : -1,
              )
              .slice(0, 3)
              .map((mint: any, index) => (
                <li className="inline-block" key={index}>
                  <Avatar
                    className="align-middle border-2 border-white"
                    images={mint.character?.metadata?.content?.avatars || []}
                    name={mint.character?.metadata?.content?.name}
                    size={40}
                  />
                </li>
              ))}
            {(mints.data?.count || 0) > 3 && (
              <li className="inline-block">
                <div className="align-middle border-2 border-white w-10 h-10 rounded-full inline-flex bg-gray-100 items-center justify-center text-gray-400 font-medium">
                  +{mints.data!.count - 3}
                </div>
              </li>
            )}
          </ul>
        </div>
        <Modal
          open={isLikeOpen}
          setOpen={setIsLikeOpen}
          title="Like successfull"
        >
          <div className="p-5">
            Your like has been permanently stored on the blockchain, view them{" "}
            <UniLink
              className="text-indigo-600"
              href={`${CSB_SCAN}/tx/${isLike.data?.list?.[0]?.transactionHash}`}
            >
              here
            </UniLink>
          </div>
          <div className="h-16 border-t flex items-center px-5">
            <Button isBlock onClick={() => setIsLikeOpen(false)}>
              Got it, thanks!
            </Button>
          </div>
        </Modal>
        <Modal
          open={isMintOpen}
          setOpen={setIsMintOpen}
          title="Mint successfull"
        >
          <div className="p-5">
            Your minting has been permanently stored on the blockchain, view
            them{" "}
            <UniLink
              className="text-indigo-600"
              href={`${CSB_SCAN}/tx/${isMint.data?.list?.[0]?.transactionHash}`}
            >
              here
            </UniLink>
          </div>
          <div className="h-16 border-t flex items-center px-5">
            <Button isBlock onClick={() => setIsMintOpen(false)}>
              Got it, thanks!
            </Button>
          </div>
        </Modal>
        <Modal
          open={isLikeListOpen}
          setOpen={setIsLikeListOpen}
          title="Like List"
        >
          <ul className="px-5">
            {likes.data?.list?.map((like: any, index) => (
              <li
                className="py-3 flex items-center space-x-2 text-sm"
                key={index}
              >
                <UniLink
                  href={CSB_IO && `${CSB_IO}/@${like?.fromCharacter?.handle}`}
                  className="flex items-center space-x-2 text-sm"
                >
                  <Avatar
                    className="align-middle border-2 border-white"
                    images={
                      like.fromCharacter?.metadata?.content?.avatars || []
                    }
                    name={
                      like.fromCharacter?.metadata?.content?.name ||
                      like.fromCharacter?.handle
                    }
                    size={40}
                  />
                  <span>{like.fromCharacter?.metadata?.content?.name}</span>
                  <span className="text-zinc-400 truncate max-w-xs">
                    @{like.fromCharacter?.handle}
                  </span>
                </UniLink>
                <UniLink href={CSB_SCAN + "/tx/" + like.transactionHash}>
                  <BlockchainIcon />
                </UniLink>
              </li>
            ))}
          </ul>
          <div className="h-16 border-t flex items-center px-5">
            <Button isBlock onClick={() => setIsLikeListOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
        <Modal
          open={isMintListOpen}
          setOpen={setIsMintListOpen}
          title="Mint List"
        >
          <ul className="px-5">
            {mints.data?.list?.map((mint: any, index) => (
              <li
                className="py-3 flex items-center space-x-2 text-sm"
                key={index}
              >
                <UniLink
                  href={CSB_IO && `${CSB_IO}/@${mint?.character?.handle}`}
                  className="flex items-center space-x-2 text-sm"
                >
                  <Avatar
                    className="align-middle border-2 border-white"
                    images={mint.character?.metadata?.content?.avatars || []}
                    name={
                      mint.character?.metadata?.content?.name ||
                      mint.character?.handle
                    }
                    size={40}
                  />
                  <span>{mint.character?.metadata?.content?.name}</span>
                  <span className="text-zinc-400 truncate max-w-xs">
                    @{mint.character?.handle}
                  </span>
                </UniLink>
                <UniLink href={CSB_SCAN + "/tx/" + mint.transactionHash}>
                  <BlockchainIcon />
                </UniLink>
              </li>
            ))}
          </ul>
          <div className="h-16 border-t flex items-center px-5">
            <Button isBlock onClick={() => setIsMintListOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
      </div>
      <Comment page={page} />
    </>
  )
}
