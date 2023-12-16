"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { CSB_SCAN, SITE_URL } from "~/lib/env"
import { toGateway, toIPFS } from "~/lib/ipfs-parser"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"
import { useGetBlockNumber } from "~/queries/site"

export const BlockchainInfo = ({
  site,
  page,
}: {
  site?: ExpandedCharacter
  page?: ExpandedNote
}) => {
  const t = useTranslations()

  const ipfs = (page ? page.metadata?.uri : site?.metadata?.uri) || ""

  const type = page
    ? page?.metadata?.content?.tags?.includes("post")
      ? "post"
      : "page"
    : "blog"

  const [realBlockNumber, setRealBlockNumber] = useState<number | null>(null)
  const { data: blockNumber } = useGetBlockNumber()

  useEffect(() => {
    if (blockNumber) {
      setRealBlockNumber(blockNumber)
    }
  }, [blockNumber])

  useEffect(() => {
    const interval = setInterval(() => {
      setRealBlockNumber((prevCount) => {
        if (prevCount) {
          return prevCount + 1
        }
        return null
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="xlog-blockchain-info max-w-screen-lg mx-auto mt-20 mb-10 px-5 cursor-default">
      <div className="text-sm bg-zinc-50 rounded-xl py-6 p-8">
        <span className="flex items-center text-gray-900 mb-4">
          <BlockchainIcon className="mr-1" />
          <span>
            {t("signed and stored on the blockchain", {
              ns: "site",
              name: t(type),
            })}
          </span>
          <a
            className="inline-flex items-center"
            target="_blank"
            rel="noreferrer"
            href={`${SITE_URL}/about`}
          >
            <i className="i-mingcute-question-line" />
          </a>
        </span>
        <ul className="space-y-2 text-[13px] text-gray-500 overflow-hidden">
          <li>
            <div className="font-medium">{t("Blockchain ID")}</div>
            <div>
              <BlockchainInfoLink
                href={`${CSB_SCAN}/tx/${
                  site?.transactionHash || page?.transactionHash
                }`}
              >
                #{site?.characterId}
                {page?.noteId && `-${page?.noteId}`}
                <span className="ml-2">
                  {!!blockNumber &&
                    !!realBlockNumber &&
                    `(${t("Confirmed by {blockNumber} blocks", {
                      blockNumber:
                        realBlockNumber -
                        (page?.blockNumber || site?.blockNumber || 0),
                    })})`}
                </span>
              </BlockchainInfoLink>
            </div>
          </li>
          <li>
            <div className="font-medium">{t("Owner")}</div>
            <div>
              <BlockchainInfoLink
                href={`${CSB_SCAN}/address/${page?.owner || site?.owner}`}
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
                  >
                    {t("Creation")} {page?.transactionHash.slice(0, 10)}
                    ...{page?.transactionHash.slice(-10)}
                  </BlockchainInfoLink>
                  <BlockchainInfoLink
                    href={`${CSB_SCAN}/tx/${page?.updatedTransactionHash}`}
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
                  >
                    {t("Creation")} {site?.transactionHash.slice(0, 10)}
                    ...{site?.transactionHash.slice(-10)}
                  </BlockchainInfoLink>
                  <BlockchainInfoLink
                    href={`${CSB_SCAN}/tx/${site?.updatedTransactionHash}`}
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
      </div>
    </section>
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
