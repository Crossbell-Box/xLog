import { APP_NAME, OUR_DOMAIN } from "~/lib/env"
import { UniLink } from "../ui/UniLink"

export const SiteFooter: React.FC<{ site: { name: string } }> = ({ site }) => {
  return (
    <footer className="bg-indigo-50/50 text-zinc-500">
      <div className="max-w-screen-md mx-auto px-5 py-32">
        <span className="font-medium">
          &copy;{" "}
          <UniLink href="/" className="hover:text-indigo-500">
            {site.name}
          </UniLink>{" "}
          · Published on{" "}
          <UniLink
            href={`https://${OUR_DOMAIN}`}
            className="hover:text-indigo-500"
          >
            {APP_NAME}
          </UniLink>
        </span>
      </div>
    </footer>
  )
}
