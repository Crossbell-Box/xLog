import { Button } from "~/components/ui/Button"
import { useStore } from "~/lib/store"
import { Dialog } from "@headlessui/react"
import { trpc } from "~/lib/trpc"
import { useForm } from "react-hook-form"
import { useEffect } from "react"

export const LoginModal: React.FC = () => {
  const [loginModalOpened, setLoginModalOpened] = useStore((store) => [
    store.loginModalOpened,
    store.setLoginModalOpened,
  ])
  const {
    mutate: requestLoginLink,
    status: requestLoginLinkStatus,
    data,
    error,
  } = trpc.useMutation("auth.requestLoginLink")

  const form = useForm({
    defaultValues: {
      email: "",
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    requestLoginLink({
      email: values.email,
      url: location.href,
    })
  })

  return (
    <Dialog
      open={loginModalOpened}
      onClose={() => setLoginModalOpened(false)}
      className="fixed z-10 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-white opacity-75" />

        <div className="relative bg-white rounded-lg overflow-hidden max-w-sm shadow-modal w-full mx-auto">
          <Dialog.Title className="bg-zinc-200 h-12 flex items-center px-3 text-sm text-zinc-600 justify-center">
            Continue with Email
          </Dialog.Title>

          <div className="p-8">
            {data && (
              <div className="mb-5">
                We just emailed you with a link to log in, please check your
                inbox and spam folder in case you can{`'`}t find it.
              </div>
            )}
            {error && <div className="mb-5 text-red-500">{error.message}</div>}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block mb-1 font-medium text-zinc-600"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input is-block"
                  {...form.register("email")}
                />
              </div>
              <div>
                <Button
                  type="submit"
                  isBlock
                  isLoading={requestLoginLinkStatus === "loading"}
                >
                  Continue
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default LoginModal
