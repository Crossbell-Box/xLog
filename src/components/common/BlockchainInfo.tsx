import { CSB_IO, CSB_SCAN } from "~/lib/env"
import { UniLink } from "../ui/UniLink"
import { Profile, Note } from "~/lib/types"
import { Disclosure } from "@headlessui/react"
import { ChevronUpIcon } from "@heroicons/react/20/solid"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { toIPFS, toGateway } from "~/lib/ipfs-parser"
import { IPFS_GATEWAY } from "~/lib/env"

export const BlockchainInfo: React.FC<{
  site?: Profile | null
  page?: Note | null
}> = ({ site, page }) => {
  return (
    <div className="text-sm">
      <Disclosure defaultOpen={true}>
        {({ open }: { open: boolean }) => (
          <>
            <Disclosure.Button
              className="flex w-full justify-between rounded-lg px-4 py-2 text-left text-gray-900 hover:bg-zinc-100 transition-colors md:rounded-xl"
              aria-label="toggle chain info"
            >
              <span>
                <BlockchainIcon className="w-4 h-4 inline-block align-middle mr-2" />
                <span className="align-middle">
                  This{" "}
                  {page
                    ? page.tags?.includes("post")
                      ? "post"
                      : "page"
                    : "blog"}{" "}
                  has been signed and permanently stored on the blockchain by
                  its creator.
                </span>
              </span>
              <ChevronUpIcon
                className={`${
                  open ? "rotate-180" : "rotate-90"
                } h-5 w-5 text-gray-500 transform transition-transform`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-5 py-2 text-sm text-gray-500 w-full overflow-hidden">
              <ul className="space-y-2">
                {page && (
                  <li>
                    <div className="font-medium">Note ID</div>
                    <div>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mr-4 break-all"
                        href={`${CSB_IO}/notes/${page?.id}`}
                        key={page?.id}
                      >
                        {page?.id}
                      </a>
                    </div>
                  </li>
                )}
                <li>
                  <div className="font-medium">Owner</div>
                  <div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mr-4 break-all"
                      href={`${CSB_SCAN}/address/${
                        page?.metadata?.owner || site?.metadata?.owner
                      }`}
                      key={page?.metadata?.owner || site?.metadata?.owner}
                    >
                      {page?.metadata?.owner || site?.metadata?.owner}
                    </a>
                  </div>
                </li>
                <li>
                  <div className="font-medium">Transaction Hash</div>
                  <div>
                    {page
                      ? page?.related_urls
                          ?.filter((url) => url.startsWith(CSB_SCAN + "/tx/"))
                          .map((url, index) => {
                            return (
                              <a
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mr-4 break-all"
                                href={url}
                                key={url}
                              >
                                {index === 0 ? "Creation" : "Last Update"}{" "}
                                {url
                                  .replace(CSB_SCAN + "/tx/", "")
                                  .slice(0, 10)}
                                ...
                                {url.replace(CSB_SCAN + "/tx/", "").slice(-10)}
                              </a>
                            )
                          })
                      : site?.metadata?.transactions.map(
                          (hash: string, index: number) => {
                            return (
                              <a
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mr-4 break-all"
                                href={`${CSB_SCAN}/tx/${hash}`}
                                key={hash}
                              >
                                {index === 0 ? "Creation" : "Last Update"}{" "}
                                {hash.slice(0, 10)}...{hash.slice(-10)}
                              </a>
                            )
                          },
                        )}
                  </div>
                </li>
                <li>
                  <div className="font-medium">IPFS Address</div>
                  <div>
                    {page
                      ? page.related_urls
                          ?.filter((url) => url.startsWith(IPFS_GATEWAY))
                          .map((url) => {
                            return (
                              <a
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mr-4 break-all"
                                href={url}
                                key={url}
                              >
                                {toIPFS(url)}
                              </a>
                            )
                          })
                      : site?.metadata?.uri && (
                          <a
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mr-4 break-all"
                            href={toGateway(site?.metadata?.uri)}
                            key={site?.metadata?.uri}
                          >
                            {site?.metadata?.uri}
                          </a>
                        )}
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
