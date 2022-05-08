import { Button } from "~/components/ui/Button"
import { useStore } from "~/lib/store"
import { Dialog } from "@headlessui/react"
import { useEffect, useState } from "react"
import { trpc } from "~/lib/trpc"
import { useFormik } from "formik"

export const LoginModal: React.FC = () => {
  const [loginModalOpened, setLoginModalOpened] = useStore((store) => [
    store.loginModalOpened,
    store.setLoginModalOpened,
  ])
  const requestLoginLink = trpc.useMutation("auth.requestLoginLink")

  const form = useFormik({
    initialValues: {
      email: "",
    },
    async onSubmit(values) {
      await requestLoginLink.mutateAsync({
        email: values.email,
        url: location.href,
      })
    },
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
            {requestLoginLink.data && (
              <div className="mb-5">
                We just emailed you with a link to log in, please check your
                inbox and spam folder in case you can't find it.
              </div>
            )}
            <form className="space-y-5" onSubmit={form.handleSubmit}>
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
                  value={form.values.email}
                  onChange={form.handleChange}
                />
              </div>
              <div>
                <Button
                  type="submit"
                  isBlock
                  isLoading={requestLoginLink.isLoading}
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
