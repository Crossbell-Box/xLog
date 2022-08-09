import { GetServerSideProps } from "next"
import { useEffect, useState } from "react"
import { DashboardIcon } from "~/components/icons/DashboardIcon"
import { MainLayout } from "~/components/main/MainLayout"
import { UniLink } from "~/components/ui/UniLink"
import { getAuthUser } from "~/lib/auth.server"
import { FLY_REGION } from "~/lib/env.server"
import { useStore } from "~/lib/store"
import { useAccount } from "wagmi"
import { ConnectButton } from "~/components/common/ConnectButton"
import Image from "next/image"
import { DotsHorizontalIcon } from "@heroicons/react/solid"
import { LaughIcon } from "~/components/icons/LaughIcon"
import { LoveIcon } from "~/components/icons/LoveIcon"
import { Button } from "~/components/ui/Button"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useRouter } from "next/router"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {
      region: FLY_REGION,
    },
  }
}

export default function Home({ region }: { region: string | null }) {
  const setLoginModalOpened = useStore((store) => store.setLoginModalOpened)
  const [addressIn, setAddressIn] = useState<string>("")
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const router = useRouter()

  useEffect(() => {
    console.log("-> region", region)

    setAddressIn(address || "")
  }, [region, address])

  const [isTry, setIsTry] = useState(false)
  const tryNow = () => {
    setIsTry(true)
    openConnectModal?.()
  }

  useEffect(() => {
    if (isTry && address) {
      router.push("/dashboard")
      setIsTry(false)
    }
  }, [isTry, address, router])

  return (
    <MainLayout>
      <section>
        <div className="max-w-screen-lg px-5 mx-auto">
          <div className="mt-28">
            <h2 className="text-6xl font-bold">
              Blog on the Blockchain.
              <br />
              Blogging geekily.
            </h2>
            <h3 className="mt-5 text-zinc-500">
              Meet xlog, the on-chain and open-source blogging platform for
              everyone.
              <br />
              Blog data, including config, posts, following, comment...
              Permanently stored on the blockchain and signed by you.
            </h3>
            <div className="mt-10">
              {addressIn ? (
                <UniLink
                  href="/dashboard"
                  className="text-indigo-500 inline-flex items-center space-x-2 hover:text-indigo-600"
                >
                  <span className="i-bi-grid text-lg"></span>
                  <span>Dashboard</span>
                </UniLink>
              ) : (
                <ConnectButton />
              )}
            </div>
            <div className="mt-8 text-zinc-500">
              Trusted by these awesome teams and geeks
              <ul className="mt-4 space-x-4">
                <li className="inline-flex w-20 align-middle items-center">
                  <Image
                    src="/RSS3.png"
                    alt="RSS3"
                    width="2518"
                    height="629"
                  ></Image>
                </li>
                <li className="inline-flex h-5 align-middle items-center">
                  <UniLink className="inline-block" href="#">
                    <DotsHorizontalIcon className="w-4 h-4" />
                  </UniLink>
                </li>
              </ul>
            </div>
            <ul className="my-28 space-y-24">
              <li className="relative w-full flex items-center justify-center">
                <div className="w-3/5">
                  <Image
                    src="/screenshot2.png"
                    alt="screenshot2"
                    width="812"
                    height="1041"
                  ></Image>
                </div>
                <div className="w-2/5 px-8">
                  <p className="text-4xl font-bold">
                    <LoveIcon className="inline mb-2" />
                    <br />
                    Rich interactions
                  </p>
                  <p className="text-zinc-500 mt-4">
                    Users can follow, comment, like, and collect your blog and
                    posts, all on the blockchain of course.
                  </p>
                </div>
              </li>
              <li className="relative w-full flex items-center justify-center">
                <div className="w-3/5">
                  <Image
                    src="/screenshot3.png"
                    alt="screenshot3"
                    width="1101"
                    height="721"
                  ></Image>
                </div>
                <div className="w-2/5 px-8">
                  <p className="text-4xl font-bold">
                    <DashboardIcon className="inline mb-2" />
                    <br />
                    Highly customizable
                  </p>
                  <p className="text-zinc-500 mt-4">
                    Domain name, navigation bar, custom styles, all as you wish,
                    and stored on the blockchain.
                  </p>
                </div>
              </li>
              <li className="relative w-full flex items-center justify-center">
                <div className="w-3/5">
                  <Image
                    src="/screenshot1.png"
                    alt="screenshot1"
                    width="812"
                    height="835"
                  ></Image>
                </div>
                <div className="w-2/5 px-8">
                  <p className="text-4xl font-bold">
                    <LaughIcon className="inline mb-2" />
                    <br />
                    Elegant
                  </p>
                  <p className="text-zinc-500 mt-4">
                    Elegant and clean default theme allows you to get a great
                    looking blog straight away.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="mt-10 text-center">
            <p className="text-5xl font-bold mb-8">xlog</p>
            {addressIn ? (
              <UniLink
                href="/dashboard"
                className="text-indigo-500 inline-flex items-center space-x-2 hover:text-indigo-600"
              >
                <Button size="xl">Try xlog today</Button>
              </UniLink>
            ) : (
              <Button onClick={tryNow} size="xl">
                Try xlog today
              </Button>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
