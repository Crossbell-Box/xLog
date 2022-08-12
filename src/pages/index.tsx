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
import { DotsHorizontalIcon, CheckIcon, XIcon } from "@heroicons/react/solid"
import { LaughIcon } from "~/components/icons/LaughIcon"
import { LoveIcon } from "~/components/icons/LoveIcon"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { Button } from "~/components/ui/Button"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useRouter } from "next/router"
import { GITHUB_LINK } from "~/lib/env"

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

  const description = [
    {
      screenshot: {
        src: "/screenshot4.png",
        width: 1542,
        height: 630,
      },
      icon: <BlockchainIcon className="inline mb-2" />,
      title: "Blockchain",
      text: (
        <>
          All blog data, including config, posts, following, comment...
          Permanently stored on the blockchain <b>by your own hands</b> and can
          only be controlled by yourself and not the platform.
        </>
      ),
    },
    {
      screenshot: {
        src: "/screenshot2.png",
        width: 812,
        height: 1041,
      },
      icon: <LoveIcon className="inline mb-2" />,
      title: "Rich Interactions",
      text: "Users can follow, comment, like, and mint your blog and posts, all on the blockchain of course.",
    },
    {
      screenshot: {
        src: "/screenshot3.png",
        width: 1101,
        height: 721,
      },
      icon: <DashboardIcon className="inline mb-2" />,
      title: "Highly Customizable",
      text: "Domain name, navigation bar, custom styles, all as you wish, and stored on the blockchain.",
    },
    {
      screenshot: {
        src: "/screenshot1.png",
        width: 812,
        height: 835,
      },
      icon: <LaughIcon className="inline mb-2" />,
      title: "Elegant",
      text: "Elegant and clean default theme allows you to get a great looking blog straight away.",
    },
  ]

  const comparing = [
    "Only Controlled by Yourself",
    "Open Source",
    "Self-hosting",
    "Like Posts",
    "Comment Posts",
    "Custom Domain",
    "Custom CSS",
    "Navigation",
    "Pages",
    "Scheduled Publishing",
  ]

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
              Meet xlog, the on-chain and{" "}
              <UniLink href={GITHUB_LINK}>open-source</UniLink> blogging
              platform for everyone.
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
              {description.map((item, index) => (
                <li
                  className="relative w-full flex items-center justify-center"
                  key={index}
                >
                  <div className="w-3/5">
                    <Image
                      src={item.screenshot.src}
                      alt={item.title}
                      width={item.screenshot.width}
                      height={item.screenshot.height}
                    ></Image>
                  </div>
                  <div className="w-2/5 px-8">
                    <p className="text-4xl font-bold">
                      {item.icon}
                      <br />
                      {item.title}
                    </p>
                    <p className="text-zinc-500 mt-4">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <table className="mb-28 w-full table-fixed">
              <tbody>
                <tr className="border-b text-xl">
                  <th className="text-center w-60"></th>
                  <th className="text-center py-3">xlog</th>
                  <th className="text-center">Mirror.xyz</th>
                </tr>
                {comparing.map((item, index) => (
                  <tr className="border-b" key={index}>
                    <td className="text-center py-3">{item}</td>
                    <td className="text-center">
                      <CheckIcon className="inline-block w-6 h-6 text-green-600" />
                    </td>
                    <td className="text-center">
                      <XIcon className="inline-block w-6 h-6 text-red-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-10 text-center">
            <p className="text-5xl font-bold mb-8">logo</p>
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
