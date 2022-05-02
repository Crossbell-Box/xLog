import { Button } from "~/components/ui/Button"
import { useStore } from "~/lib/store"
import { Dialog } from "@headlessui/react"
import { useEffect, useState } from "react"
import { useFetcher } from "@remix-run/react"

export const LoginModal: React.FC = () => {
  const [loginModalOpened, setLoginModalOpened] = useStore((store) => [
    store.loginModalOpened,
    store.setLoginModalOpened,
  ])
  const fetcher = useFetcher()

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
            {fetcher.data && (
              <div className="mb-5">
                We just emailed you with a link to log in, please check your
                inbox and spam folder in case you can't find it.
              </div>
            )}
            <fetcher.Form
              className="space-y-5"
              method="post"
              action="/api/request-login-link"
            >
              <div>
                <label
                  className="block mb-1 font-medium text-zinc-600"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input is-block"
                />
              </div>
              <div>
                <Button
                  type="submit"
                  isBlock
                  isLoading={fetcher.state === "submitting"}
                >
                  Continue
                </Button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default LoginModal
