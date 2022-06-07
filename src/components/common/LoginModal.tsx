import { Button } from "~/components/ui/Button"
import { useStore } from "~/lib/store"
import { trpc } from "~/lib/trpc"
import { useForm } from "react-hook-form"
import { Modal } from "../ui/Modal"
import { UniLink } from "../ui/UniLink"
import { DOCS_DOMAIN } from "~/lib/env"

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
    <Modal
      title={`Continue with Email`}
      open={loginModalOpened}
      setOpen={setLoginModalOpened}
    >
      <div className="p-5">
        {data && (
          <div className="mb-5">
            We just emailed you with a link to log in, please check your inbox
            and spam folder in case you can{`'`}t find it.
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
          <div className="text-xs text-zinc-400">
            By clicking Continue, you agree to our{" "}
            <UniLink
              href={`https://${DOCS_DOMAIN}/terms.html`}
              className="underline"
            >
              Terms of Service
            </UniLink>{" "}
            and{" "}
            <UniLink
              href={`https://${DOCS_DOMAIN}/privacy.html`}
              className="underline"
            >
              Privacy Policy
            </UniLink>
            .
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default LoginModal
