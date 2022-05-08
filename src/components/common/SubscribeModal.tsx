import React from "react"
import { useFormik } from "formik"
import { useStore } from "~/lib/store"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import toast from "react-hot-toast"

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

  const subscribeForm = useFormik({
    initialValues: {
      email: true,
      telegram: false,
    },
    onSubmit(values) {
      toast.success("not implemented")
    },
  })

  const unsubscribeForm = useFormik({ initialValues: {}, onSubmit() {} })

  return (
    <Modal title="Become a subscriber" open={open} setOpen={setOpen}>
      <form className="p-5" onSubmit={subscribeForm.handleSubmit}>
        <div>
          <label className="select-none flex items-center space-x-1">
            <input
              type="checkbox"
              checked={subscribeForm.values.email}
              onChange={(e) =>
                subscribeForm.setFieldValue("email", e.target.checked)
              }
            />
            <Badge className="mr-1">Soon</Badge>
            <span>Receive updates via Email</span>
          </label>
        </div>
        <div className="">
          <label className="select-none flex items-center space-x-1">
            <input
              type="checkbox"
              checked={subscribeForm.values.telegram}
              onChange={(e) =>
                subscribeForm.setFieldValue("telegram", e.target.checked)
              }
            />
            <Badge>Soon</Badge>
            <span>Receive updates via Telegram</span>
          </label>
        </div>
        <div className="mt-5 space-x-3">
          <Button type="submit" isLoading={subscribeForm.isSubmitting}>
            <span>{subscription ? "Update" : "Subscribe"}</span>
          </Button>
          {subscription && (
            <form className="inline" onSubmit={unsubscribeForm.handleSubmit}>
              <Button
                type="submit"
                variant="secondary"
                isLoading={unsubscribeForm.isSubmitting}
              >
                Unsubscribe
              </Button>
            </form>
          )}
        </div>
      </form>
    </Modal>
  )
}
