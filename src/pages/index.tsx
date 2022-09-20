import { GetServerSideProps } from "next"
import { useEffect, useState } from "react"
import { DashboardIcon } from "~/components/icons/DashboardIcon"
import { MainLayout } from "~/components/main/MainLayout"
import { UniLink } from "~/components/ui/UniLink"
import { FLY_REGION } from "~/lib/env.server"
import { useStore } from "~/lib/store"
import { useAccount } from "wagmi"
import { ConnectButton } from "~/components/common/ConnectButton"
import Image from "next/image"
import { DotsHorizontalIcon, CheckIcon, XIcon } from "@heroicons/react/solid"
import { LoveIcon } from "~/components/icons/LoveIcon"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { Button } from "~/components/ui/Button"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useRouter } from "next/router"
import { GITHUB_LINK, APP_NAME, CSB_SCAN } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { Link, Element } from "react-scroll"

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
      title: "On-chain",
      text: (
        <>
          All blog data, including configs, posts, following, comments, etc.,
          are permanently stored on the blockchain <b>with your own hands</b>{" "}
          and can only be controlled by yourself and not the platform.
        </>
      ),
    },
    {
      screenshot: {
        src: "/screenshot2.png",
        width: 1528,
        height: 946,
      },
      icon: <LoveIcon className="inline mb-2" />,
      title: "Rich Interactions",
      text: "You can follow, comment, like, and mint your blog and posts, all on the blockchain of course.",
    },
    {
      screenshot: {
        src: "/screenshot3.png",
        width: 4232,
        height: 1486,
      },
      icon: <DashboardIcon className="inline mb-2" />,
      title: "Highly Customizable",
      text: "Domain name, navigation bar, custom styles, all as you wish, and stored on the blockchain.",
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
    <MainLayout tabs={["Features", `Why ${APP_NAME}`]}>
      <section>
        <div className="max-w-screen-lg px-5 mx-auto">
          <div className="h-screen w-full flex justify-center flex-col relative">
            <div className="w-28 h-28 mb-16">
              <Image alt="logo" src="/logo.svg" width={200} height={200} />
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold mb-5">Blog Free</h2>
            <h3 className="mt-5 text-zinc-800 text-4xl sm:text-6xl font-light">
              {APP_NAME}, an{" "}
              <UniLink className="underline decoration-2" href={CSB_SCAN}>
                on-chain
              </UniLink>{" "}
              and{" "}
              <UniLink className="underline decoration-2" href={GITHUB_LINK}>
                open-source
              </UniLink>{" "}
              blogging platform for everyone.
            </h3>
            <div className="my-10 sm:my-16">
              <Button
                className="text-accent w-80 h-10"
                onClick={() =>
                  addressIn ? router.push("/dashboard") : openConnectModal?.()
                }
                size="xl"
              >
                {addressIn ? (
                  <>
                    <span className="i-bi-grid text-lg mr-2"></span>
                    <span>Dashboard</span>
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
            <div className="text-center absolute bottom-20 w-full">
              <Link
                to="Features"
                spy={true}
                smooth={true}
                duration={500}
                className="cursor-pointer inline-block i-fluent:ios-arrow-rtl-24-filled text-3xl rotate-90"
              ></Link>
            </div>
          </div>
          <div>
            <Element name="Features">
              <ul className="pt-28 space-y-24">
                {description.map((item, index) => (
                  <li className="relative w-full" key={index}>
                    <p className="text-4xl font-bold">
                      <span className="mr-4">{item.icon}</span>
                      {item.title}
                    </p>
                    <p className="text-3xl font-light mt-4 leading-normal mb-8">
                      {item.text}
                    </p>
                    <div>
                      <Image
                        src={item.screenshot.src}
                        alt={item.title}
                        width={item.screenshot.width}
                        height={item.screenshot.height}
                      ></Image>
                    </div>
                  </li>
                ))}
              </ul>
            </Element>
            <Element name={`Why ${APP_NAME}`}>
              <div className="pt-28 text-4xl font-bold">Why {APP_NAME}</div>
              <div className="text-xl mt-10 leading-normal">
                We believe freedom of expression is a universal right. In your
                long-form writing, you should be able to express your thoughts
                freely; without fear of your post being removed or censored.
                xLog ensures that whatever you write, it will be immutable and
                permanently stored.
              </div>
              <div className="my-10 text-zinc-500">
                Trusted by these awesome teams and geeks
                <ul className="mt-4 space-x-4">
                  <li className="inline-flex w-20 align-middle items-center">
                    <UniLink
                      href={getSiteLink({
                        subdomain: "rss3",
                      })}
                    >
                      <Image
                        src="/RSS3.png"
                        alt="RSS3"
                        width="2518"
                        height="629"
                      ></Image>
                    </UniLink>
                  </li>
                  <li className="inline-flex w-12 align-middle items-center">
                    <UniLink
                      href={getSiteLink({
                        subdomain: "crossbell-blog",
                      })}
                    >
                      <Image
                        src="/Crossbell.svg"
                        alt="Crossbell"
                        width="1000"
                        height="1000"
                      ></Image>
                    </UniLink>
                  </li>
                  <li className="inline-flex h-5 align-middle items-center">
                    <UniLink className="inline-block" href="#">
                      <DotsHorizontalIcon className="w-4 h-4" />
                    </UniLink>
                  </li>
                </ul>
              </div>
            </Element>
          </div>
          <div className="my-20 text-center">
            <div className="w-20 h-20 mx-auto mb-8">
              <Image alt="logo" src="/logo.svg" width={100} height={100} />
            </div>
            {addressIn ? (
              <UniLink
                href="/dashboard"
                className="text-accent inline-flex items-center space-x-2"
              >
                <Button size="xl">Try {APP_NAME} Today</Button>
              </UniLink>
            ) : (
              <Button onClick={tryNow} size="xl">
                Try {APP_NAME} Today
              </Button>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
