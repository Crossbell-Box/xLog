import { APP_NAME, OUR_DOMAIN } from "~/lib/env"
import { UniLink } from "../ui/UniLink"
import { Profile, Note } from "~/lib/types"
import { Disclosure } from "@headlessui/react"
import { ChevronUpIcon } from "@heroicons/react/solid"

export const BlockchainInfo: React.FC<{
  site?: Profile
  page?: Note
}> = ({ site, page }) => {
  return (
    <div className="text-sm">
      <Disclosure>
        {({ open }: { open: boolean }) => (
          <>
            <Disclosure.Button className="flex w-full justify-between rounded-lg px-4 py-2 text-left text-gray-900 hover:bg-zinc-100 transition-colors md:rounded-xl">
              <span>
                🔔 This{" "}
                {page
                  ? page.tags?.includes("post")
                    ? "post"
                    : "page"
                  : "blog"}{" "}
                has been permanently stored on the blockchain and signed by its
                creator.
              </span>
              <ChevronUpIcon
                className={`${
                  open ? "rotate-180" : "rotate-90"
                } h-5 w-5 text-gray-500 transform transition-transform`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-5 pt-4 pb-2 text-sm text-gray-500">
              <ul>
                <li className="mt-2">
                  <div className="font-medium">
                    Blockchain Transaction
                    {(
                      page?.related_urls?.filter((url) =>
                        url.startsWith("https://scan.crossbell.io/tx/"),
                      ) || site?.metadata?.transactions
                    )?.length > 1
                      ? "s"
                      : ""}
                  </div>
                  <div>
                    {page
                      ? page?.related_urls
                          ?.filter((url) =>
                            url.startsWith("https://scan.crossbell.io/tx/"),
                          )
                          .map((url) => {
                            return (
                              <a
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mr-4 break-all"
                                href={url}
                                key={url}
                              >
                                {url
                                  .replace("https://scan.crossbell.io/tx/", "")
                                  .slice(0, 10)}
                                ...
                                {url
                                  .replace("https://scan.crossbell.io/tx/", "")
                                  .slice(-10)}
                              </a>
                            )
                          })
                      : site?.metadata?.transactions.map((hash: string) => {
                          return (
                            <a
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block mr-4 break-all"
                              href={`https://scan.crossbell.io/tx/${hash}`}
                              key={hash}
                            >
                              {hash.slice(0, 10)}...{hash.slice(-10)}
                            </a>
                          )
                        })}
                  </div>
                </li>
                <li className="mt-2">
                  <div className="font-medium">IPFS Address</div>
                  <div>
                    {page
                      ? page.related_urls
                          ?.filter((url) =>
                            url.startsWith("https://gateway.ipfs.io/ipfs/"),
                          )
                          .map((url) => {
                            return (
                              <a
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mr-4 break-all"
                                href={url}
                                key={url}
                              >
                                {url.replace(
                                  "https://gateway.ipfs.io/ipfs/",
                                  "ipfs://",
                                )}
                              </a>
                            )
                          })
                      : site?.metadata?.uri && (
                          <a
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mr-4 break-all"
                            href={site?.metadata?.uri.replace(
                              "ipfs://",
                              "https://gateway.ipfs.io/ipfs/",
                            )}
                            key={site?.metadata?.uri}
                          >
                            {site?.metadata?.uri}
                          </a>
                        )}
                  </div>
                </li>
                <li className="mt-2">
                  <div className="font-medium">Author Address</div>
                  <div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mr-4 break-all"
                      href={`https://scan.crossbell.io/address/${
                        page?.metadata?.owner || site?.metadata?.owner
                      }`}
                      key={page?.metadata?.owner || site?.metadata?.owner}
                    >
                      {page?.metadata?.owner || site?.metadata?.owner}
                    </a>
                  </div>
                </li>
              </ul>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  )
}
