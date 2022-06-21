import { logout } from "~/lib/auth.client"
import {
  APP_DESCRIPTION,
  APP_NAME,
  DOCS_DOMAIN,
  GITHUB_LINK,
  OUR_DOMAIN,
} from "~/lib/env"
import { useStore } from "~/lib/store"
import { SEOHead } from "../common/SEOHead"
import { UniLink } from "../ui/UniLink"
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function MainLayout({
  children,
  title,
}: {
  children?: React.ReactNode
  title?: string
}) {
  const setLoginModalOpened = useStore((store) => store.setLoginModalOpened)
  const discordLink = `https://${OUR_DOMAIN}/discord`
  const companyLinks = [
    { text: "Blog", href: `https://blog.${OUR_DOMAIN}` },
    { text: "Privacy", href: `https://${DOCS_DOMAIN}/privacy.html` },
    { text: "Terms", href: `https://${DOCS_DOMAIN}/terms.html` },
  ]

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
            <ConnectButton />
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-10 text-sm font-medium text-zinc-500">
        <div className="max-w-screen-md px-5 mx-auto flex justify-between">
          <div>
            <span>&copy; {APP_NAME}</span>
            <div className="text-zinc-400 mt-2 flex items-center space-x-1">
              <UniLink href={discordLink}>
                <span className="inline-block i-mdi-discord text-xl hover:text-indigo-500"></span>
              </UniLink>
              {GITHUB_LINK && (
                <UniLink href={GITHUB_LINK}>
                  <span className="inline-block i-mdi-github text-xl hover:text-zinc-900"></span>
                </UniLink>
              )}
            </div>
          </div>
          <ul className="text-right text-zinc-400 transition-colors">
            {companyLinks.map((link) => {
              return (
                <li key={link.text}>
                  <UniLink href={link.href} className="hover:text-indigo-500">
                    {link.text}
                  </UniLink>
                </li>
              )
            })}
          </ul>
        </div>
      </footer>
    </>
  )
}
