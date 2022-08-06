import { APP_NAME, OUR_DOMAIN } from "~/lib/env"
import { UniLink } from "../ui/UniLink"
import { IS_PROD } from "~/lib/constants"
import { useAccount } from "wagmi"
import { useEffect, useState } from "react"
import { Profile } from "~/lib/types"

export const SiteFooter: React.FC<{ site?: Profile }> = ({ site }) => {
  const { address } = useAccount()

  const [isOwner, setIsOwner] = useState(false)
  useEffect(() => {
    if (address && address.toLowerCase() === site?.metadata?.owner) {
      setIsOwner(true)
    } else {
      setIsOwner(false)
    }
  }, [address, site?.metadata?.owner])

  return (
    <footer className="text-zinc-500 border-t">
      <div className="max-w-screen-md mx-auto px-5 py-16">
        <span className="font-medium">
          &copy;{" "}
          <UniLink href="/" className="hover:text-indigo-500">
            {site?.name}
          </UniLink>{" "}
          · Published on{" "}
          <UniLink
            href={`https://${OUR_DOMAIN}`}
            className="hover:text-indigo-500"
          >
            {APP_NAME}
          </UniLink>{isOwner ?
          <>
            {" · "}
            <UniLink
              href={`${IS_PROD ? "https" : "http"}://${OUR_DOMAIN}/dashboard/${site?.username}`}
              className="hover:text-indigo-500"
            >
              Dashboard
            </UniLink>
          </> : ""}
        </span>
      </div>
    </footer>
  )
}
