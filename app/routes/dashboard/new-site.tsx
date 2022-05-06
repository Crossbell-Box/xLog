import {
  type ActionFunction,
  json,
  type LoaderFunction,
  redirect,
} from "@remix-run/node"
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react"
import { z } from "zod"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"
import { OUR_DOMAIN } from "~/lib/env"

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getAuthUser(request, true)

  return json({
    viewer: {
      email: user.email,
    },
  })
}

export const action: ActionFunction = async ({ request }) => {
  const user = await getAuthUser(request, true)
  const formData = await request.formData()
  const values = z
    .object({
      name: z.string(),
      subdomain: z.string(),
    })
    .parse(Object.fromEntries(formData))
  const { site } = await siteController.createSite(user, values)
  return redirect(`/dashboard/${site.subdomain}`)
}

export default function NewSitePage() {
  const { viewer } = useLoaderData()
  const transition = useTransition()

  return (
    <div>
      <header className="px-5 text-sm  md:px-14 flex justify-between items-start py-10">
        <Link to="/dashboard" className="flex space-x-1 items-center">
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
        </Link>
        <div>
          <div className="text-zinc-400">Logged in as:</div>
          <div>{viewer.email}</div>
        </div>
      </header>
      <div className="max-w-sm mx-auto mt-20">
        <h2 className="text-3xl mb-10 text-center">Create a new site</h2>
        <Form className="space-y-5" method="post">
          <div>
            <Input name="name" id="name" label="Site Name" required isBlock />
          </div>
          <div>
            <Input
              name="subdomain"
              id="subdomain"
              label="Subdomain"
              required
              isBlock
              addon={`.${OUR_DOMAIN}`}
            />
          </div>
          <div>
            <Button
              type="submit"
              isBlock
              isLoading={transition.state === "submitting"}
            >
              Create
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
