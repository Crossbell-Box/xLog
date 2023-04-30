import { useTranslation } from "next-i18next"

import { Disclosure } from "@headlessui/react"

import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { CSB_SCAN, IPFS_GATEWAY } from "~/lib/env"
import { toCid, toGateway, toIPFS } from "~/lib/ipfs-parser"
import { ExpandedCharacter, Note } from "~/lib/types"
import { cn } from "~/lib/utils"
import { useGetGreenfieldId } from "~/queries/site"

export const BlockchainInfo: React.FC<{
  site?: ExpandedCharacter
  page?: Note | null
}> = ({ site, page }) => {
  const { t } = useTranslation(["common", "site"])

  const ipfs =
    (page
      ? page.related_urls?.filter((url) => url.startsWith(IPFS_GATEWAY))?.[0]
      : site?.metadata?.uri) || ""
  const greenfieldId = useGetGreenfieldId(toCid(ipfs))

  const type = page ? (page?.tags?.includes("post") ? "post" : "page") : "blog"

  return (
    <div className="text-sm">
      <Disclosure defaultOpen={true}>
        {({ open }: { open: boolean }) => (
          <>
            <Disclosure.Button
              className="flex w-full justify-between items-center rounded-lg px-4 py-2 text-left text-gray-900 hover:bg-hover transition-colors md:rounded-xl focus-visible:ring focus-visible:ring-accent focus-visible:ring-opacity-50"
              aria-label="toggle chain info"
              data-hide-print
            >
              <span className="flex items-center">
                <BlockchainIcon className="mr-1" />
                <span>
                  {t("signed and stored on the blockchain", {
                    ns: "site",
                    name: t(type),
                  })}
                </span>
              </span>
              <span
                className={cn(
                  "icon-[mingcute--up-line] text-lg text-gray-500 transform transition-transform",
                  open ? "" : "rotate-180",
                )}
              ></span>
            </Disclosure.Button>
            <Disclosure.Panel className="px-5 py-2 text-[13px] text-gray-500 w-full overflow-hidden">
              <ul className="space-y-2">
                <li>
                  <div className="font-medium">{t("Owner")}</div>
                  <div>
                    <BlockchainInfoLink
                      href={`${CSB_SCAN}/address/${
                        page?.metadata?.owner || site?.owner
                      }`}
                      key={page?.metadata?.owner || site?.owner}
                    >
                      {page?.metadata?.owner || site?.owner}
                    </BlockchainInfoLink>
                  </div>
                </li>
                <li>
                  <div className="font-medium">{t("Transaction Hash")}</div>
                  <div>
                    {page ? (
                      page?.related_urls
                        ?.filter((url) => url.startsWith(CSB_SCAN + "/tx/"))
                        .map((url, index) => {
                          return (
                            <BlockchainInfoLink href={url} key={url}>
                              {t(index === 0 ? "Creation" : "Last Update")}{" "}
                              {url.replace(CSB_SCAN + "/tx/", "").slice(0, 10)}
                              ...
                              {url.replace(CSB_SCAN + "/tx/", "").slice(-10)}
                            </BlockchainInfoLink>
                          )
                        })
                    ) : (
                      <>
                        <BlockchainInfoLink
                          href={`${CSB_SCAN}/tx/${site?.transactionHash}`}
                          key={site?.transactionHash}
                        >
                          {t("Creation")} {site?.transactionHash.slice(0, 10)}
                          ...{site?.transactionHash.slice(-10)}
                        </BlockchainInfoLink>
                        <BlockchainInfoLink
                          href={`${CSB_SCAN}/tx/${site?.updatedTransactionHash}`}
                          key={site?.updatedTransactionHash}
                        >
                          {t("Last Update")}{" "}
                          {site?.updatedTransactionHash.slice(0, 10)}...
                          {site?.updatedTransactionHash.slice(-10)}
                        </BlockchainInfoLink>
                      </>
                    )}
                  </div>
                </li>
                <li>
                  <div className="font-medium">{t("IPFS Address")}</div>
                  <div>
                    <BlockchainInfoLink href={toGateway(ipfs)}>
                      {toIPFS(ipfs)}
                    </BlockchainInfoLink>
                  </div>
                </li>
                {greenfieldId.data?.greenfieldId && (
                  <li>
                    <div className="font-medium">
                      {t("BNB Greenfield Address")}
                    </div>
                    <div>
                      <BlockchainInfoLink
                        href={
                          "https://greenfieldscan.com/" +
                          (greenfieldId.data?.transactionHash
                            ? `txn/${greenfieldId.data?.transactionHash}`
                            : "")
                        }
                      >
                        {greenfieldId.data?.greenfieldId}
                      </BlockchainInfoLink>
                    </div>
                  </li>
                )}
              </ul>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  )
}

function BlockchainInfoLink({
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-block mr-4 break-all focus-visible:ring focus-visible:ring-accent",
        className,
      )}
      {...props}
    />
  )
}
