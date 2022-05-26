import React, { useEffect } from "react"
import { useStore } from "~/lib/store"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import toast from "react-hot-toast"
import { trpc } from "~/lib/trpc"
import { Input } from "../ui/Input"
import { useForm } from "react-hook-form"
import { useRouter } from "next/router"

export const SubscribeModal: React.FC<{
  siteId: string
  subscription?: {
    email?: boolean
  } | null
  isLoggedIn: boolean
}> = ({ siteId, subscription, isLoggedIn }) => {
  const router = useRouter()
  const [open, setOpen] = useStore((store) => [
    store.subscribeModalOpened,
    store.setSubscribeModalOpened,
  ])
  const subscribe = trpc.useMutation("site.subscribe")
  const unsubscribe = trpc.useMutation("site.unsubscribe")
  const trpcContext = trpc.useContext()

  const subscribeForm = useForm({
    defaultValues: {
      newUserEmail: "",
      email: subscription?.email ?? true,
    },
  })

  const handleSubscribe = subscribeForm.handleSubmit((values) => {
    subscribe.mutate({
      siteId,
      email: values.email,
      newUser: isLoggedIn
        ? undefined
        : {
            email: values.newUserEmail,
            url: location.href,
          },
    })
  })

  useEffect(() => {
    if (subscribe.isSuccess && isLoggedIn) {
      subscribe.reset()
      toast.success(subscription ? "Updated!" : "Subscribed!")
      trpcContext.invalidateQueries("site.subscription")
    }
  }, [subscribe, isLoggedIn, subscription, trpcContext])

  useEffect(() => {
    if (unsubscribe.isSuccess) {
      unsubscribe.reset()
      toast.success("Unsubscribed!")
      trpcContext.invalidateQueries("site.subscription")
    }
  }, [unsubscribe, trpcContext])

  return (
    <Modal
      title={subscription ? `Manage your subscription` : `Become a subscriber`}
      open={open}
      setOpen={(open) => {
        setOpen(open)
        if (!open && "subscription" in router.query) {
          const query = new URLSearchParams(window.location.search)
          query.delete("subscription")
          const search = query.toString()
          router.replace(
            `${window.location.pathname}${search ? `?${search}` : ""}`,
          )
        }
      }}
    >
      {subscribe.isSuccess && !isLoggedIn ? (
        <div className="p-5 space-y-3">
          <p>
            We have sent you an email with a link to confirm your subscription.
          </p>
          <p>Please check your inbox (and spam folder).</p>
        </div>
      ) : (
        <form className="p-5" onSubmit={handleSubscribe}>
          {!isLoggedIn && (
            <div className="mb-5">
              <Input
                label="Email"
                type="email"
                id="email"
                isBlock
                required
                {...subscribeForm.register("newUserEmail", {})}
              />
            </div>
          )}
          <div>
            <label className="select-none flex items-center space-x-1">
              <input type="checkbox" {...subscribeForm.register("email")} />
              <span>Receive updates via Email</span>
            </label>
          </div>
          <div className="mt-5 space-x-3 flex items-center">
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
