import { useFormik } from "formik"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect } from "react"
import toast from "react-hot-toast"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { OUR_DOMAIN } from "~/lib/env"
import { trpc } from "~/lib/trpc"

export default function NewSitePage() {
  const router = useRouter()
  const viewer = trpc.useQuery(["auth.viewer"])
  const createSite = trpc.useMutation("site.create")

  const form = useFormik({
    initialValues: {
      name: "",
      subdomain: "",
    },
    onSubmit(values) {
      createSite.mutate(values)
    },
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
        <form className="space-y-5" onSubmit={form.handleSubmit}>
          <div>
            <Input
              name="name"
              id="name"
              label="Site Name"
              required
              isBlock
              value={form.values.name}
              onChange={form.handleChange}
            />
          </div>
          <div>
            <Input
              name="subdomain"
              id="subdomain"
              label="Subdomain"
              required
              isBlock
              addon={`.${OUR_DOMAIN}`}
              value={form.values.subdomain}
              onChange={form.handleChange}
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
  )
}
