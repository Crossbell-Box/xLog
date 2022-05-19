import Link from "next/link"
import { logout } from "~/lib/auth.client"
import { APP_DESCRIPTION, APP_NAME } from "~/lib/env"
import { useStore } from "~/lib/store"
import { truthy } from "~/lib/utils"
import { SEOHead } from "../common/SEOHead"
import { UniLink } from "../ui/UniLink"

export function MainLayout({
  isLoggedIn,
  children,
  region,
  title,
}: {
  isLoggedIn: boolean
  children?: React.ReactNode
  region: string | null
  title?: string
}) {
  const setLoginModalOpened = useStore((store) => store.setLoginModalOpened)

  return (
    <>
      <SEOHead
        title={title}
        siteName={APP_NAME}
        description={APP_DESCRIPTION}
      />
      <header className="py-10">
        <div className="max-w-screen-md px-5 mx-auto flex justify-between items-center">
          <h1 className="inline-block text-2xl font-extrabold">{APP_NAME}</h1>
          <div className="space-x-5">
            {isLoggedIn ? (
              <UniLink
                onClick={logout}
                className="space-x-2 rounded-full px-4 h-8 inline-flex items-center text-sm text-indigo-500 font-medium hover:bg-indigo-50"
              >
                <span>Sign Out</span>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </UniLink>
            ) : (
              <UniLink
                onClick={() => {
                  setLoginModalOpened(true)
                }}
                className="bg-indigo-100 rounded-full px-4 h-8 inline-flex items-center text-sm text-indigo-500 font-medium"
              >
                Sign In
              </UniLink>
            )}
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-10 text-sm font-medium text-zinc-500">
        <div className="max-w-screen-md px-5 mx-auto">
          <span>&copy; {APP_NAME}</span>
          <span className="mx-3">·</span>
          <span>
            Region: <span className="uppercase">{region}</span>
          </span>
        </div>
      </footer>
    </>
  )
}
