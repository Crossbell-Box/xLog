import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { UniLink } from "~/components/ui/UniLink"
import Image from "next/image"

export default function SubdomainIndex() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string
  return (
    <DashboardLayout title="Dashboard">
      <DashboardMain>
        <div className="prose max-w-screen-md">
          <div className="w-14 h-14 mb-8">
            <Image alt="logo" src="/logo.svg" width={100} height={100} />
          </div>
          <p>Hello there,</p>
          <p>
            This page is quite empty for now, but we will polish it very soon!
            Maybe some useful analytics!
          </p>
          <p>Here{`'`}re some useful links:</p>
          <ul>
            <li>
              <UniLink href={`/dashboard/${subdomain}/editor?type=post`}>
                Create a Post
              </UniLink>
            </li>
            <li>
              <UniLink href={`/dashboard/${subdomain}/settings/general`}>
                Change Site Name or Icon
              </UniLink>
            </li>
          </ul>
        </div>
      </DashboardMain>
    </DashboardLayout>
  )
}
