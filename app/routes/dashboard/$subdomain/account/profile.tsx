import { type LoaderFunction } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { useEffect } from "react"
import toast from "react-hot-toast"
import { AvatarForm } from "~/components/dashboard/AvatarForm"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { getAuthUser } from "~/lib/auth.server"

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getAuthUser(request, true)
  return {
    viewer: {
      id: user.id,
      avatar: user.avatar,
      name: user.name,
      username: user.username,
      email: user.email,
    },
  }
}

export default function AccountProfilePage() {
  const { viewer } = useLoaderData()
  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.type === "done") {
      toast.success("Saved!")
    }
  }, [fetcher.type])

  return (
    <>
      <div>
        <label className="label">Profile Picture</label>
        <AvatarForm filename={viewer.avatar} name={viewer.name} />
      </div>
      <fetcher.Form method="post" action={`/api/viewer`}>
        <div className="mt-5">
          <Input
            label="Display Name"
            id="name"
            name="name"
            required
            type="text"
            defaultValue={viewer.name}
          />
        </div>
        <div className="mt-5">
          <Input
            label="Username"
            id="username"
            name="username"
            required
            type="text"
            defaultValue={viewer.username}
          />
        </div>
        <div className="mt-5">
          <Input
            label="Email"
            id="email"
            name="email"
            required
            type="email"
            defaultValue={viewer.email}
          />
        </div>
        <div className="mt-10">
          <Button type="submit" isLoading={fetcher.state === "submitting"}>
            Save
          </Button>
        </div>
      </fetcher.Form>
    </>
  )
}
