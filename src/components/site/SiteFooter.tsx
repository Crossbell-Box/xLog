import { APP_NAME, OUR_DOMAIN } from "~/lib/env"
import { UniLink } from "../ui/UniLink"
import { IS_PROD } from "~/lib/constants"
import { useAccount } from "wagmi"
import { useEffect, useState } from "react"
import { Profile, Note } from "~/lib/types"

export const SiteFooter: React.FC<{
  site?: Profile
  page?: Note
}> = ({ site, page }) => {
  return (
    <footer className="text-zinc-500 border-t">
      <div className="max-w-screen-md mx-auto px-5 py-10 text-xs">
        <p className="mb-4">🔔 This {page ? (page.tags?.includes("post") ? "post" : "page") : "blog"} has been permanently stored on the blockchain and signed by its creator.</p>
        <ul className="mb-6">
          <li className="mt-2">
            <div className="font-bold">Blockchain Transaction</div>
            <div>
              {page ?
              page?.related_urls?.filter((url) => url.startsWith("https://scan.crossbell.io/tx/")).map((url) => {
                return <a target="_blank" rel="noreferrer" className="inline-block mr-4 break-all" href={url} key={url}>{url.replace("https://scan.crossbell.io/tx/", "").slice(0, 10)}...{url.replace("https://scan.crossbell.io/tx/", "").slice(-10)}</a>
              }) :
              site?.metadata?.transactions.map((hash: string) => {
                return <a target="_blank" rel="noreferrer" className="inline-block mr-4 break-all" href={`https://scan.crossbell.io/tx/${hash}`} key={hash}>{hash.slice(0, 10)}...{hash.slice(-10)}</a>
              })
              }
            </div>
          </li>
          {
            page && 
            <li className="mt-2">
              <div className="font-bold">IPFS Address</div>
              <div>{page?.related_urls?.filter((url) => url.startsWith("https://gateway.ipfs.io/ipfs/")).map((url) => {
                return <a target="_blank" rel="noreferrer" className="inline-block mr-4 break-all" href={url} key={url}>{url.replace("https://gateway.ipfs.io/ipfs/", "ipfs://")}</a>
              })}</div>
            </li>
          }
          <li className="mt-2">
            <div className="font-bold">Author Address</div>
            <div>
              <a target="_blank" rel="noreferrer" className="inline-block mr-4 break-all" href={`https://scan.crossbell.io/address/${site?.metadata?.owner}`} key={site?.metadata?.owner}>{site?.metadata?.owner}</a>
            </div>
          </li>
        </ul>
        <p className="font-medium text-sm text-gray-800">
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
