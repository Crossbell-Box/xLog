import { useFetcher } from "@remix-run/react"
import React from "react"
import { useStore } from "~/lib/store"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"

export const SubscribeModal: React.FC<{
  siteId: string
  subscription?: {
    telegram?: boolean
    email?: boolean
  } | null
}> = ({ siteId, subscription }) => {
  const [open, setOpen] = useStore((store) => [
    store.subscribeModalOpened,
    store.setSubscribeModalOpened,
  ])
  const subscribeFetcher = useFetcher()
  const unsubscribeFetcher = useFetcher()

  return (
    <Modal title="Become a subscriber" open={open} setOpen={setOpen}>
      <subscribeFetcher.Form
        className="p-5"
        method="post"
        action={`/api/sites/${siteId}/subscribe`}
      >
        <div>
          <label className="select-none flex items-center space-x-1">
            <input type="checkbox" defaultChecked={subscription?.email} />
            <Badge className="mr-1">Soon</Badge>
            <span>Receive updates via Email</span>
          </label>
        </div>
        <div className="">
          <label className="select-none flex items-center space-x-1">
            <input type="checkbox" defaultChecked={subscription?.telegram} />
            <Badge>Soon</Badge>
            <span>Receive updates via Telegram</span>
          </label>
        </div>
        <div className="mt-5 space-x-3">
          <Button
            type="submit"
            isLoading={subscribeFetcher.state === "submitting"}
          >
            <span>{subscription ? "Update" : "Subscribe"}</span>
          </Button>
          {subscription && (
            <unsubscribeFetcher.Form
              action={`/api/sites/${siteId}/unsubscribe`}
              method="post"
              className="inline"
            >
              <Button
                type="submit"
                variant="secondary"
                isLoading={unsubscribeFetcher.state === "submitting"}
              >
                Unsubscribe
              </Button>
            </unsubscribeFetcher.Form>
          )}
        </div>
      </subscribeFetcher.Form>
    </Modal>
  )
}
