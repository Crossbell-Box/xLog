import React, { useEffect } from "react"
import { useFormik } from "formik"
import { useStore } from "~/lib/store"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import toast from "react-hot-toast"
import { trpc } from "~/lib/trpc"
import { Input } from "../ui/Input"

export const SubscribeModal: React.FC<{
  siteId: string
  subscription?: {
    telegram?: boolean
    email?: boolean
  } | null
  isLoggedIn: boolean
}> = ({ siteId, subscription, isLoggedIn }) => {
  const [open, setOpen] = useStore((store) => [
    store.subscribeModalOpened,
    store.setSubscribeModalOpened,
  ])
  const subscribe = trpc.useMutation("site.subscribe")
  const unsubscribe = trpc.useMutation("site.unsubscribe")
  const trpcContext = trpc.useContext()

  const subscribeForm = useFormik({
    initialValues: {
      newUserEmail: "",
      email: subscription?.email ?? true,
      telegram: subscription?.telegram ?? false,
    },
    onSubmit(values) {
      subscribe.mutate({
        siteId,
        email: values.email,
        telegram: values.telegram,
        newUser: isLoggedIn
          ? undefined
          : {
              email: values.newUserEmail,
              url: location.href,
            },
      })
    },
  })

  useEffect(() => {
    if (subscribe.isSuccess && isLoggedIn) {
      subscribe.reset()
      toast.success(subscription ? "Updated!" : "Subscribed!")
      trpcContext.invalidateQueries("site.subscription")
    }
  }, [subscribe, isLoggedIn, subscription])

  useEffect(() => {
    if (unsubscribe.isSuccess) {
      unsubscribe.reset()
      toast.success("Unsubscribed!")
      trpcContext.invalidateQueries("site.subscription")
    }
  }, [unsubscribe])

  return (
    <Modal title="Become a subscriber" open={open} setOpen={setOpen}>
      {subscribe.isSuccess && !isLoggedIn ? (
        <div className="p-5 space-y-3">
          <p>
            We have sent you an email with a link to confirm your subscription.
          </p>
          <p>Please check your inbox (and spam folder).</p>
        </div>
      ) : (
        <form className="p-5" onSubmit={subscribeForm.handleSubmit}>
          {!isLoggedIn && (
            <div className="mb-5">
              <Input
                label="Email"
                name="newUserEmail"
                type="email"
                isBlock
                value={subscribeForm.values.newUserEmail}
                onChange={subscribeForm.handleChange}
              />
            </div>
          )}
          <div>
            <label className="select-none flex items-center space-x-1">
              <input
                type="checkbox"
                checked={subscribeForm.values.email}
                onChange={(e) =>
                  subscribeForm.setFieldValue("email", e.target.checked)
                }
              />
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
              <span>Receive updates via Telegram</span>
            </label>
          </div>
          <div className="mt-5 space-x-3">
            <Button type="submit" isLoading={subscribe.isLoading}>
              <span>{subscription ? "Update" : "Subscribe"}</span>
            </Button>
            {subscription && (
              <Button
                type="button"
                variant="secondary"
                isLoading={unsubscribe.isLoading}
                onClick={() => unsubscribe.mutate({ siteId })}
              >
                Unsubscribe
              </Button>
            )}
          </div>
        </form>
      )}
    </Modal>
  )
}
