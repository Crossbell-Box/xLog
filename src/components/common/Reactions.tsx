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
import { SITE_URL, CSB_SCAN } from "~/lib/env"
import { UniLink } from "~/components/ui/UniLink"
import { Modal } from "~/components/ui/Modal"
import { Avatar } from "../ui/Avatar"
import { MintIcon } from "~/components/icons/MintIcon"
import { getLikes, getMints } from "~/models/page.model"
import { CharacterList } from "~/components/common/CharacterList"
import clsx from "clsx"

export const Reactions: React.FC<{
  className?: string
  size?: "sm" | "base"
  pageId?: string
}> = ({ className, size, pageId }) => {
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
    pageId: pageId,
    includeCharacter: size !== "sm",
  })
  const isLike = useCheckLike({
    address,
    pageId: pageId,
  })

  const mints = useGetMints({
    pageId: pageId,
    includeCharacter: size !== "sm",
  })
  const isMint = useCheckMint({
    address,
    pageId: pageId,
  })

  const like = async () => {
    if (!address) {
      setLikeProgress(true)
      openConnectModal?.()
    } else if (!userSite.data) {
      router.push(`${SITE_URL}/dashboard/new-site`)
    } else if (pageId) {
      if (isLike.data?.count) {
        setIsLikeOpen(true)
      } else {
        likePage.mutate({
          address,
          pageId: pageId,
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
    } else if (pageId) {
      if (isMint.data?.count) {
        setIsMintOpen(true)
      } else {
        mintPage.mutate({
          address,
          pageId: pageId,
        })
      }
    }
  }

  useEffect(() => {
    if (
      mintProgress &&
      address &&
      isMint.isSuccess &&
      pageId &&
      userSite.isSuccess
    ) {
      if (!userSite.data) {
        router.push(`${SITE_URL}/dashboard/new-site`)
      }
      if (!isMint.data.count) {
        mintPage.mutate({
          address,
          pageId: pageId,
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
    pageId,
  ])

  useEffect(() => {
    if (
      likeProgress &&
      address &&
      isLike.isSuccess &&
      pageId &&
      userSite.isSuccess
    ) {
      if (!userSite.data) {
        router.push(`${SITE_URL}/dashboard/new-site`)
      }
      if (!isLike.data.count) {
        likePage.mutate({
          address,
          pageId: pageId,
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
    pageId,
  ])

  const [likeList, setLikeList] = useState<any[]>([])
  const [likeCursor, setLikeCursor] = useState<string>()
  useEffect(() => {
    if (likes.isSuccess && likes.data) {
      setLikeList(likes.data.list || [])
      setLikeCursor(likes.data.cursor || "")
    }
  }, [likes.isSuccess, likes.data])

  const loadMoreLikes = async () => {
    if (likeCursor && pageId) {
      const subs = await getLikes({
        pageId: pageId,
        cursor: likeCursor,
      })
      setLikeList((prev) => [...prev, ...(subs?.list || [])])
      setLikeCursor(subs?.cursor || "")
    }
  }

  const [mintList, setMintList] = useState<any[]>([])
  const [mintCursor, setMintCursor] = useState<string>()
  useEffect(() => {
    if (mints.isSuccess && mints.data) {
      setMintList(mints.data.list || [])
      setMintCursor(mints.data.cursor || "")
    }
  }, [mints.isSuccess, mints.data])

  const loadMoreMints = async () => {
    if (mintCursor && pageId) {
      const subs = await getMints({
        pageId: pageId,
        cursor: mintCursor,
      })
      setMintList((prev) => [...prev, ...(subs?.list || [])])
      setMintCursor(subs?.cursor || "")
    }
  }

  return (
    <>
      <div
        className={clsx(
          "xlog-reactions flex fill-gray-400 text-gray-500 items-center",
          size === "sm" ? "text-sm" : "",
          className,
        )}
      >
        <div
          className={clsx(
            "xlog-reactions-like flex items-center",
            size === "sm" ? "mr-3" : "mr-10",
          )}
        >
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
            <LikeIcon
              className={"mr-1 " + (size === "sm" ? "w-4 h-4" : "w-10 h-10")}
            />
            <span>{likes.data?.count || 0}</span>
          </Button>
          {size !== "sm" && (
            <ul
              className="-space-x-4 cursor-pointer"
              onClick={() => setIsLikeListOpen(true)}
            >
              {likes.data?.list
                ?.sort((a, b) =>
                  b.fromCharacter?.metadata?.content?.avatars?.[0] ? 1 : -1,
                )
                .slice(0, 3)
                ?.map((like: any, index) => (
                  <li className="inline-block" key={index}>
                    <Avatar
                      className="relative align-middle border-2 border-white"
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
                  <div className="relative align-middle border-2 border-white w-10 h-10 rounded-full inline-flex bg-gray-100 items-center justify-center text-gray-400 font-medium">
                    +{likes.data!.count - 3}
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>
        <div className="xlog-reactions-mint flex items-center">
          <Button
            variant="collect"
            className={`flex items-center mr-2 ${
              isMint.isSuccess && isMint.data.count && "active"
            }`}
            isAutoWidth={true}
            onClick={mint}
            isLoading={mintPage.isLoading || likeProgress}
          >
            <MintIcon
              className={clsx("mr-2", size === "sm" ? "w-3 h-3" : "w-8 h-8")}
            />
            <span>{mints.data?.count || 0}</span>
          </Button>
          {size !== "sm" && (
            <ul
              className="-space-x-4 cursor-pointer"
              onClick={() => setIsMintListOpen(true)}
            >
              {mints.data?.list
                ?.sort((a, b: any) =>
                  b.character?.metadata?.content?.avatars?.[0] ? 1 : -1,
                )
                .slice(0, 3)
                .map((mint: any, index) => (
                  <li className="inline-block" key={index}>
                    <Avatar
                      className="relative align-middle border-2 border-white"
                      images={mint.character?.metadata?.content?.avatars || []}
                      name={mint.character?.metadata?.content?.name}
                      size={40}
                    />
                  </li>
                ))}
              {(mints.data?.count || 0) > 3 && (
                <li className="inline-block">
                  <div className="relative align-middle border-2 border-white w-10 h-10 rounded-full inline-flex bg-gray-100 items-center justify-center text-gray-400 font-medium">
                    +{mints.data!.count - 3}
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>
        <Modal
          open={isLikeOpen}
          setOpen={setIsLikeOpen}
          title="Like successfull"
        >
          <div className="p-5">
            Your like has been permanently stored on the blockchain, view them{" "}
            <UniLink
              className="text-accent"
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
              className="text-accent"
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
        <CharacterList
          open={isLikeListOpen}
          setOpen={setIsLikeListOpen}
          title="Like List"
          loadMore={loadMoreLikes}
          hasMore={!!likeCursor}
          list={likeList}
        ></CharacterList>
        <CharacterList
          open={isMintListOpen}
          setOpen={setIsMintListOpen}
          title="Mint List"
          loadMore={loadMoreMints}
          hasMore={!!mintCursor}
          list={mintList}
        ></CharacterList>
      </div>
    </>
  )
}
