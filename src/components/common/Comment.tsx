import clsx from "clsx"
import { Note, Profile } from "~/lib/types"
import { useAccount } from "wagmi"
import { useGetUserSites } from "~/queries/site"
import { Avatar } from "~/components/ui/Avatar"
import { Input } from "~/components/ui/Input"
import { Button } from "~/components/ui/Button"
import { useForm } from "react-hook-form"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useState, useEffect } from "react"
import { useCommentPage, useGetComments } from "~/queries/page"
import { useRouter } from "next/router"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"
import { UniLink } from "~/components/ui/UniLink"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import data from "@emoji-mart/data"
// @ts-ignore
import Picker from "@emoji-mart/react"
import { Popover } from "@headlessui/react"
import { EmojiHappyIcon } from "@heroicons/react/outline"
import { CSB_SCAN } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"

dayjs.extend(duration)
dayjs.extend(relativeTime)

export const Comment: React.FC<{
  page?: Note
  className?: string
}> = ({ page, className }) => {
  const { address } = useAccount()
  const userSites = useGetUserSites(address)
  const { openConnectModal } = useConnectModal()
  const commentPage = useCommentPage()
  const router = useRouter()
  const [viewer, setViewer] = useState<Profile | null>(null)
  const [addressIn, setAddressIn] = useState("")
  const comments = useGetComments({
    pageId: page?.id,
  })

  useEffect(() => {
    setAddressIn(address || "")
  }, [address])

  useEffect(() => {
    if (userSites.isSuccess && userSites.data?.length) {
      setViewer(userSites.data[0])
    }
  }, [userSites, router])

  const form = useForm({
    defaultValues: {
      content: "",
    },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!address) {
      openConnectModal?.()
    } else if (userSites.isSuccess && !userSites.data?.length) {
      router.push(`/dashboard/new-site`)
    } else {
      commentPage.mutate({
        address,
        pageId: page!.id,
        content: values.content,
        externalUrl: window.location.href,
      })
    }
  })

  useEffect(() => {
    if (commentPage.isSuccess) {
      form.reset()
    }
  }, [commentPage.isSuccess, form])

  return (
    <div className={clsx("xlog-comment", "comment", className)}>
      <div className="xlog-comment-count border-b pb-2 mb-6">
        <span>
          {comments.data?.count || "0"} Comment
          {comments.data?.count && comments.data.count > 1 ? "s" : ""}
        </span>
      </div>
      <div className="xlog-comment-input flex">
        <Avatar
          className="align-middle mr-3"
          images={viewer?.avatars || []}
          name={viewer?.name}
          size={45}
        />
        <form className="w-full" onSubmit={handleSubmit}>
          <div>
            <Input
              id="content"
              isBlock
              required={
                !!addressIn && userSites.isSuccess && !!userSites.data?.length
              }
              disabled={
                !addressIn || !userSites.isSuccess || !userSites.data?.length
              }
              multiline
              maxLength={30}
              className="mb-2"
              placeholder="Write a comment on the blockchain"
              {...form.register("content", {})}
            />
          </div>
          <div className="flex justify-between">
            <Popover className="relative">
              {({ open }: { open: boolean }) => (
                <>
                  <Popover.Button className="group inline-flex items-center rounded-md px-2 text-xl">
                    <EmojiHappyIcon className="w-6 h-6 text-zinc-400 hover:text-zinc-500" />
                  </Popover.Button>
                  <Popover.Panel className="absolute left-0 mt-3 ">
                    <Picker
                      data={data}
                      onEmojiSelect={(e: any) =>
                        form.setValue(
                          "content",
                          form.getValues("content") + e.native,
                        )
                      }
                    />
                  </Popover.Panel>
                </>
              )}
            </Popover>
            <Button
              type="submit"
              isLoading={userSites.isLoading || commentPage.isLoading}
            >
              {addressIn
                ? userSites.isSuccess && !userSites.data?.length
                  ? "Create Character"
                  : "Submit"
                : "Connect"}
            </Button>
          </div>
        </form>
      </div>
      <div className="xlog-comment-list">
        {comments.data?.list?.map((comment) => (
          <div
            key={comment.transactionHash}
            className="flex border-b border-dashed py-6"
          >
            <UniLink
              href={
                comment?.character?.handle &&
                getSiteLink({
                  subdomain: comment.character.handle,
                })
              }
              className="align-middle mr-3"
            >
              <Avatar
                images={comment?.character?.metadata?.content?.avatars || []}
                name={comment?.character?.metadata?.content?.name}
                size={45}
              />
            </UniLink>
            <div className="flex-1 flex flex-col rounded-lg">
              <div className="mb-2 text-sm">
                <UniLink
                  href={
                    comment?.character?.handle &&
                    getSiteLink({
                      subdomain: comment.character.handle,
                    })
                  }
                  className="font-medium text-theme-color"
                >
                  {comment?.character?.metadata?.content?.name}
                </UniLink>{" "}
                ·{" "}
                {dayjs
                  .duration(
                    dayjs(comment?.createdAt).diff(dayjs(), "minute"),
                    "minute",
                  )
                  .humanize()}{" "}
                ago ·{" "}
                <UniLink href={`${CSB_SCAN}/tx/${comment.transactionHash}`}>
                  <BlockchainIcon className="w-3 h-3 inline-block" />
                </UniLink>
              </div>
              <div>{comment.metadata?.content?.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
