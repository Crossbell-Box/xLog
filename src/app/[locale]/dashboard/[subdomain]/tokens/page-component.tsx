"use client"

import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"

import {
  useAccountBalance,
  useClaimCSBStatus,
  useWalletClaimCSBModal,
} from "@crossbell/connect-kit"

import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { Button } from "~/components/ui/Button"
import { UniLink } from "~/components/ui/UniLink"
import { MIRA_LINK } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { useGetMiraBalance, useGetSite } from "~/queries/site"

export default function TokensPage() {
  const params = useParams()
  const t = useTranslations()
  const subdomain = params?.subdomain as string
  const site = useGetSite(subdomain)

  const miraBalance = useGetMiraBalance(site.data?.characterId)
  const csbBalance = useAccountBalance()
  const claimCSBStatus = useClaimCSBStatus()
  const claimCSBModal = useWalletClaimCSBModal()

  const tokens = [
    {
      name: "MIRA",
      balance: miraBalance.isLoading
        ? "Loading..."
        : miraBalance.data?.data || 0,
      description: (
        <>
          <p>
            {t(
              "$MIRA is a valuable token in the Crossbell world, and can be easily exchanged on the Crosschain Bridge and Uniswap",
            )}
          </p>
          <p>
            {t("In the early stage, xLog will use $MIRA to motivate creators")}
          </p>
          <p>{t("You can obtain $MIRA through the following ways:")}</p>
          <ul className="ml-2">
            <li>
              1.{" "}
              <UniLink
                className="underline"
                href={`${getSiteLink({
                  subdomain: "xlog",
                })}/creator-incentive-plan`}
              >
                {t("Creator incentive program")}
              </UniLink>
            </li>
            <li>
              2.{" "}
              <UniLink
                className="underline"
                href={`/dashboard/${subdomain}/events`}
              >
                {t("Participate in events")}
              </UniLink>
            </li>
            <li>
              3.{" "}
              <UniLink className="underline" href={MIRA_LINK}>
                {t("Swap from USDC")}
              </UniLink>
            </li>
            <li>4. {t("Received tips and sponsorships from readers")}</li>
          </ul>
        </>
      ),
      buttons: (
        <div className="w-fit space-x-4">
          <Button onClick={() => window.open(MIRA_LINK)}>
            <>{t("Swap to USDC") || ""}</>
          </Button>
          <UniLink
            className="underline text-zinc-500"
            href={`${getSiteLink({ subdomain: "atlas" })}/swap-mira-for-usdc`}
          >
            {t("Swap Tutorial")}
          </UniLink>
        </div>
      ),
    },
    {
      name: "CSB",
      balance: csbBalance?.balance?.formatted || 0,
      description: (
        <>
          {t(
            "This is a token used for interaction on the Crossbell blockchain, which can be claimed for free from the faucet, so there's no need to worry about its balance",
          )}
        </>
      ),
      buttons: (
        <>
          <Button
            isDisabled={!claimCSBStatus.isEligibleToClaim}
            onClick={() => claimCSBModal.show()}
          >
            {claimCSBStatus.errorMsg || t("Free Claim")}
          </Button>
        </>
      ),
    },
    {
      name: "XLOG",
      description: t(
        "$XLOG is related to xLog DAO, but it's too early now, please stay tuned",
      ),
      balance: t("Stay tuned"),
    },
  ]

  return (
    <DashboardMain title="Tokens">
      <div className="min-w-[270px] max-w-screen-lg flex flex-col space-y-8">
        <div className="text-sm text-zinc-500 leading-relaxed">
          {t("features.Earn.description")}
        </div>
        {tokens.map((token) => {
          return (
            <div key={token.name} className="space-y-4">
              <div className="text-2xl font-medium text-accent">
                ${token.name}
              </div>
              <div className="text-zinc-500 text-sm space-y-1">
                {token.description}
              </div>
              <div className="text-lg">
                {t("Balance")}:{" "}
                <span className="font-bold">{`${token.balance}`}</span>
              </div>
              <div>{token.buttons}</div>
            </div>
          )
        })}
      </div>
    </DashboardMain>
  )
}
