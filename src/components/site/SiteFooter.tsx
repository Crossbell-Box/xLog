import { APP_NAME, OUR_DOMAIN } from "~/lib/env"
import { UniLink } from "../ui/UniLink"
import { Profile, Note } from "~/lib/types"

export const SiteFooter: React.FC<{
  site?: Profile
  page?: Note
}> = ({ site, page }) => {
  return (
    <footer className="text-zinc-500 border-t">
      <div className="max-w-screen-md mx-auto px-5 py-10 text-xs">
        <p className="font-medium text-base">
          &copy;{" "}
          <UniLink href="/" className="hover:text-indigo-500">
            {site?.username}
          </UniLink>{" "}
          · Powered by{" "}
          <UniLink
            href={`https://${OUR_DOMAIN}`}
            className="hover:text-indigo-500"
          >
            {APP_NAME}
          </UniLink>
        </p>
      </div>
    </footer>
  )
}
