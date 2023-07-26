"use client"

import { Disclosure } from "@headlessui/react"

import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { CSB_SCAN } from "~/lib/env"
import { useTranslation } from "~/lib/i18n/client"
import { toGateway, toIPFS } from "~/lib/ipfs-parser"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"

export const BlockchainInfo = ({
  site,
  page,
}: {
  site?: ExpandedCharacter
  page?: ExpandedNote
}) => {
  const { t } = useTranslation("common")

  const ipfs = (page ? page.metadata?.uri : site?.metadata?.uri) || ""

  const type = page
    ? page?.metadata?.content?.tags?.includes("post")
      ? "post"
      : "page"
    : "blog"

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
                      href={`${CSB_SCAN}/address/${page?.owner || site?.owner}`}
                      key={page?.owner || site?.owner}
                    >
                      {page?.owner || site?.owner}
                    </BlockchainInfoLink>
                  </div>
                </li>
                <li>
                  <div className="font-medium">{t("Transaction Hash")}</div>
                  <div>
                    {page ? (
                      <>
                        <BlockchainInfoLink
                          href={`${CSB_SCAN}/tx/${page?.transactionHash}`}
                          key={`create_${page?.transactionHash}`}
                        >
                          {t("Creation")} {page?.transactionHash.slice(0, 10)}
                          ...{page?.transactionHash.slice(-10)}
                        </BlockchainInfoLink>
                        <BlockchainInfoLink
                          href={`${CSB_SCAN}/tx/${page?.updatedTransactionHash}`}
                          key={`update_${page?.updatedTransactionHash}`}
                        >
                          {t("Last Update")}{" "}
                          {page?.updatedTransactionHash.slice(0, 10)}...
                          {page?.updatedTransactionHash.slice(-10)}
                        </BlockchainInfoLink>
                      </>
                    ) : (
                      <>
                        <BlockchainInfoLink
                          href={`${CSB_SCAN}/tx/${site?.transactionHash}`}
                          key={`create_${site?.transactionHash}`}
                        >
                          {t("Creation")} {site?.transactionHash.slice(0, 10)}
                          ...{site?.transactionHash.slice(-10)}
                        </BlockchainInfoLink>
                        <BlockchainInfoLink
                          href={`${CSB_SCAN}/tx/${site?.updatedTransactionHash}`}
                          key={`update_${site?.transactionHash}`}
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
