import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import type { ReactElement } from "react"
import { useDate } from "~/hooks/useDate"
import { useTranslation } from "next-i18next"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { GetServerSideProps } from "next"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import {
  useAccountState,
  useAccountBalance,
  useWalletClaimCSBModal,
  useClaimCSBStatus,
} from "@crossbell/connect-kit"
import { useGetMiraBalance } from "~/queries/site"
import { Button } from "~/components/ui/Button"
import { MIRA_LINK } from "~/lib/env"
import { UniLink } from "~/components/ui/UniLink"
import { useRouter } from "next/router"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const { props: layoutProps } = await getLayoutServerSideProps(ctx)

    return {
      props: {
        ...layoutProps,
      },
    }
  },
)

export default function TokensPage() {
  const router = useRouter()
  const { t } = useTranslation(["dashboard", "index"])
  const subdomain = router.query.subdomain as string

  const address = useAccountState((s) => s.wallet?.address)
  const miraBalance = useGetMiraBalance(address)
  const csbBalance = useAccountBalance()
  const claimCSBStatus = useClaimCSBStatus()
  const claimCSBModal = useWalletClaimCSBModal()

  const tokens = [
    {
      name: "MIRA",
      balance: miraBalance.data?.data || 0,
      description: (
        <>
          <p>
            {t(
              "1 MIRA ≈ 1 USDC, swap easily on cross-chain bridge and Uniswap.",
            )}
          </p>
          <p>
            {t("In the early stage, xLog will use $MIRA to motivate creators.")}
          </p>
          <p>{t("You can obtain $MIRA through the following ways:")}</p>
          <ul className="ml-2">
            <li>
              1.{" "}
              <UniLink className="underline" href="">
                {t("Creator incentive program.")}
              </UniLink>
            </li>
            <li>
              2.{" "}
              <UniLink
                className="underline"
                href={`/dashboard/${subdomain}/events`}
              >
                {t("Participate in events.")}
              </UniLink>
            </li>
            <li>
              3.{" "}
              <UniLink className="underline" href={MIRA_LINK}>
                {t("Swap from USDC.")}
              </UniLink>
            </li>
          </ul>
        </>
      ),
      buttons: (
        <>
          <Button onClick={() => window.open(MIRA_LINK)}>
            {t("Swap to USDC")}
          </Button>
        </>
      ),
    },
    {
      name: "CSB",
      balance: csbBalance?.balance?.formatted || 0,
      description: (
        <>
          {t(
            "This is a token used for interaction on the Crossbell blockchain, which can be claimed for free from the faucet, so there's no need to worry about its balance.",
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
        "$XLOG is related to xLog DAO, but it's too early now, please stay tuned.",
      ),
      balance: t("Stay tuned"),
    },
  ]

  return (
    <DashboardMain title="Tokens">
      <div className="min-w-[270px] max-w-screen-lg flex flex-col space-y-8">
        <div className="text-sm text-zinc-500 leading-relaxed">
          {t("features.Earn.description", { ns: "index" })}
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
                <span className="font-bold">{token.balance}</span>
              </div>
              <div>{token.buttons}</div>
            </div>
          )
        })}
      </div>
    </DashboardMain>
  )
}

TokensPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Tokens">{page}</DashboardLayout>
}
