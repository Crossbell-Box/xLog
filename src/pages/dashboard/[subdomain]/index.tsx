import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { UniLink } from "~/components/ui/UniLink"

export default function SubdomainIndex() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string
  return (
    <DashboardLayout title="Dashboard">
      <DashboardMain>
        <div className="prose max-w-screen-md">
          <p>
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M7.03 4.95L3.5 8.5c-3.33 3.31-3.33 8.69 0 12s8.69 3.33 12 0l6-6c1-.97 1-2.56 0-3.54c-.1-.12-.23-.23-.37-.32l.37-.39c1-.97 1-2.56 0-3.54c-.14-.16-.33-.3-.5-.41c.38-.92.21-2.02-.54-2.77c-.87-.87-2.22-.96-3.2-.28a2.517 2.517 0 0 0-3.88-.42l-2.51 2.51c-.09-.14-.2-.27-.32-.39a2.53 2.53 0 0 0-3.52 0m1.41 1.42c.2-.2.51-.2.71 0s.2.51 0 .71l-3.18 3.18a3 3 0 0 1 0 4.24l1.41 1.41a5.004 5.004 0 0 0 1.12-5.36l6.3-6.3c.2-.2.51-.2.7 0s.21.51 0 .71l-4.59 4.6l1.41 1.41l6.01-6.01c.2-.2.51-.2.71 0c.2.2.2.51 0 .71l-6.01 6.01l1.41 1.41l4.95-4.95c.2-.2.51-.2.71 0c.2.2.2.51 0 .71l-5.66 5.65l1.41 1.42l3.54-3.54c.2-.2.51-.2.71 0c.2.2.2.51 0 .71l-6 6.01c-2.54 2.54-6.65 2.54-9.19 0s-2.54-6.65 0-9.19l3.53-3.54M23 17c0 3.31-2.69 6-6 6v-1.5c2.5 0 4.5-2 4.5-4.5H23M1 7c0-3.31 2.69-6 6-6v1.5c-2.5 0-4.5 2-4.5 4.5H1Z"
              ></path>
            </svg>
          </p>
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
