import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { SEOHead } from "~/components/common/SEOHead"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { APP_NAME, OUR_DOMAIN } from "~/lib/env"
import { trpc } from "~/lib/trpc"

export default function NewSitePage() {
  const router = useRouter()
  const viewer = trpc.useQuery(["auth.viewer"])
  const createSite = trpc.useMutation("site.create")

  const form = useForm({
    defaultValues: {
      name: "",
      subdomain: "",
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    createSite.mutate(values)
  })

  useEffect(() => {
    if (createSite.isError) {
      createSite.reset()
      toast.error(createSite.error.message)
    } else if (createSite.isSuccess) {
      createSite.reset()
      router.push(`/dashboard/${createSite.data.subdomain}`)
    }
  }, [createSite, router])

  return (
    <>
      <SEOHead title="New Site" siteName={APP_NAME} />
      <div>
        <header className="px-5 text-sm  md:px-14 flex justify-between items-start py-10">
          <Link href="/dashboard">
            <a className="flex space-x-1 items-center">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Back to dashboard</span>
            </a>
          </Link>
          <div>
            <div className="text-zinc-400">Logged in as:</div>
            <div>{viewer.data?.email}</div>
          </div>
        </header>
        <div className="max-w-sm mx-auto mt-20">
          <h2 className="text-3xl mb-10 text-center">Create a new site</h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Input
                id="name"
                label="Site Name"
                isBlock
                required
                maxLength={30}
                {...form.register("name", {})}
              />
            </div>
            <div>
              <Input
                id="subdomain"
                label="Subdomain"
                isBlock
                required
                addon={`.${OUR_DOMAIN}`}
                minLength={3}
                maxLength={26}
                {...form.register("subdomain", {})}
              />
            </div>
            <div>
              <Button type="submit" isBlock isLoading={createSite.isLoading}>
                Create
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
