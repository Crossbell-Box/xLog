import { GetServerSideProps } from "next"
import { useEffect, useState } from "react"
import { DashboardIcon } from "~/components/icons/DashboardIcon"
import { MainLayout } from "~/components/main/MainLayout"
import { UniLink } from "~/components/ui/UniLink"
import { FLY_REGION } from "~/lib/env.server"
import { useAccount } from "wagmi"
import { LoveIcon } from "~/components/icons/LoveIcon"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { LaughIcon } from "~/components/icons/LaughIcon"
import { Button } from "~/components/ui/Button"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useRouter } from "next/router"
import { GITHUB_LINK, APP_NAME, CSB_SCAN } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { Link, Element } from "react-scroll"
import { Image } from "~/components/ui/Image"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { prefetchGetSites } from "~/queries/site.server"
import { useGetSites } from "~/queries/site"
import showcase from "../../showcase.json"
import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { useGetUserSites, useSubscribeToSites } from "~/queries/site"
import { SITE_URL } from "~/lib/env"
import { BoltIcon } from "@heroicons/react/24/outline"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  await prefetchGetSites(showcase, queryClient)

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      region: FLY_REGION,
    },
  }
}

export default function Home({ region }: { region: string | null }) {
  const [addressIn, setAddressIn] = useState<string>("")
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const router = useRouter()
  const showcaseSites = useGetSites(showcase)

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
        src: "/screenshot1.png",
        width: 3947,
        height: 1888,
      },
      icon: <LaughIcon className="inline mb-2" />,
      title: "Elegent",
      text: <>Out-of-the-box, good looking, no friction.</>,
    },
    {
      screenshot: {
        src: "/screenshot4.png",
        width: 1542,
        height: 467,
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
        src: "/screenshot5.png",
        width: 1712,
        height: 1866,
      },
      icon: <BoltIcon className="inline mb-2 w-8 h-8" />,
      title: "Fast",
      text: (
        <>
          Blockchain doesn&apos;t always mean inefficiency. xLog&apos;s
          experienced open-source maintainers have been making optimizations to
          get xLog to peak speed.
        </>
      ),
    },
    {
      screenshot: {
        src: "/screenshot2.png",
        width: 1528,
        height: 758,
      },
      icon: <LoveIcon className="inline mb-2" />,
      title: "Rich Interactions",
      text: "You can follow, comment, like, and mint your blog and posts, all on the blockchain of course.",
    },
    {
      screenshot: {
        src: "/screenshot3.png",
        width: 4394,
        height: 1854,
      },
      icon: <DashboardIcon className="inline mb-2" />,
      title: "Highly Customizable",
      text: "Domain name, navigation bar, custom styles, all as you wish, and stored on the blockchain.",
    },
  ]

  const [followProgress, setFollowProgress] = useState<boolean>(false)
  const userSite = useGetUserSites(address)
  const subscribeToSites = useSubscribeToSites()

  const followAll = async (e: any) => {
    if (!address) {
      setFollowProgress(true)
      openConnectModal?.()
    } else if (!userSite.data?.[0]) {
      router.push(`${SITE_URL}/dashboard/new-site`)
    } else {
      subscribeToSites.mutate({
        user: userSite.data?.[0],
        sites: showcaseSites.data,
      })
    }
  }

  useEffect(() => {
    if (
      followProgress &&
      address &&
      showcaseSites.isSuccess &&
      userSite.data?.[0] &&
      userSite.isSuccess
    ) {
      if (!userSite.data) {
        router.push(`${SITE_URL}/dashboard/new-site`)
      }
      subscribeToSites.mutate({
        user: userSite.data?.[0],
        sites: showcaseSites.data,
      })
      setFollowProgress(false)
    }
  }, [
    userSite.isSuccess,
    userSite.data,
    router,
    followProgress,
    address,
    showcaseSites.isSuccess,
    showcaseSites.data,
    subscribeToSites,
  ])

  return (
    <MainLayout tabs={["Features", "Showcase", "Integration"]}>
      <section>
        <div className="max-w-screen-lg px-5 mx-auto">
          <div className="h-screen w-full flex justify-center flex-col relative">
            <div className="w-28 h-28 mb-16">
              <Image alt="logo" src="/logo.svg" width={200} height={200} />
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold mb-5">Blog Free</h2>
            <h3 className="mt-5 text-zinc-800 text-4xl sm:text-6xl font-light">
              {APP_NAME}, the first{" "}
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
            <Element name="Showcase">
              <div className="pt-28 text-4xl font-bold">Showcase</div>
              <div className="my-10 text-zinc-700">
                <p className="text-lg">
                  Discover these awesome teams and geeks on xLog (sorted by
                  update time)
                </p>
                <Button
                  size="xl"
                  className="mt-5"
                  onClick={followAll}
                  isLoading={
                    followProgress ||
                    showcaseSites.isLoading ||
                    userSite.isLoading ||
                    subscribeToSites.isLoading
                  }
                >
                  🥳 Follow All!
                </Button>
                <ul className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-10">
                  {showcaseSites.data?.map((site: any) => (
                    <li className="inline-flex align-middle" key={site.handle}>
                      <UniLink
                        href={
                          site.custom_domain
                            ? `https://${site.custom_domain}`
                            : getSiteLink({
                                subdomain: site.handle,
                              })
                        }
                        className="inline-flex align-middle w-full"
                      >
                        <span className="w-14 h-14">
                          <CharacterFloatCard siteId={site.handle}>
                            <span className="w-full h-full">
                              <Image
                                className="rounded-full"
                                src={
                                  site.metadata.content?.avatars?.[0] ||
                                  "ipfs://bafkreiabgixxp63pg64moxnsydz7hewmpdkxxi3kdsa4oqv4pb6qvwnmxa"
                                }
                                alt={site.handle}
                                width="56"
                                height="56"
                              ></Image>
                            </span>
                          </CharacterFloatCard>
                        </span>
                        <span className="ml-3 min-w-0 flex-1 justify-center inline-flex flex-col">
                          <span className="truncate w-full inline-block font-medium">
                            {site.metadata.content?.name}
                          </span>
                          {site.metadata.content?.bio && (
                            <span className="text-gray-500 text-xs truncate w-full inline-block mt-1">
                              {site.metadata.content?.bio}
                            </span>
                          )}
                        </span>
                      </UniLink>
                    </li>
                  ))}
                  <li className="inline-flex h-14 align-middle items-center">
                    <UniLink
                      className="inline-block text-accent text-center"
                      href={`${GITHUB_LINK}/edit/dev/showcase.json`}
                    >
                      Submit yours
                    </UniLink>
                  </li>
                </ul>
              </div>
            </Element>
            <Element name="Integration">
              <div className="pt-28 text-4xl font-bold">Integration</div>
              <div className="my-10 text-zinc-700">
                <p className="text-xl">
                  You can integrate xLog with all of Crossbell&apos;s
                  eco-projects without friction
                </p>
                <ul className="space-y-8 mt-8">
                  <li>
                    <UniLink href="https://crossbell.io/@xlog">
                      <p className="font-bold text-xl">Crossbell.io</p>
                      <p className="text-zinc-500 my-4 text-lg">
                        Check the updates of the xLogs you follow and the posts
                        you collected
                      </p>
                      <Image
                        className="rounded-lg"
                        src="/integration1.png"
                        alt="integration1"
                        width="3726"
                        height="1888"
                      ></Image>
                    </UniLink>
                  </li>
                  <li>
                    <UniLink href="https://rss3.io/result?search=xlog.csb">
                      <p className="font-bold text-xl">RSS3</p>
                      <p className="text-zinc-500 my-4 text-lg">
                        All your activities on xLog are supported and displayed
                        by RSS3 and all eco-projects of RSS3
                      </p>
                      <Image
                        className="rounded-lg"
                        src="/integration5.png"
                        alt="integration5"
                        width="3730"
                        height="1888"
                      ></Image>
                    </UniLink>
                  </li>
                  <li>
                    <UniLink href="https://www.raycast.com/Songkeys/crossbell">
                      <p className="font-bold text-xl">Raycast Crossbell</p>
                      <p className="text-zinc-500 my-4 text-lg">
                        Searching and browsing xLog in Raycast
                      </p>
                      <Image
                        className="rounded-lg"
                        src="/integration2.png"
                        alt="integration2"
                        width="1724"
                        height="1172"
                      ></Image>
                    </UniLink>
                  </li>
                  <li>
                    <UniLink href="https://export.crossbell.io">
                      <p className="font-bold text-xl">Export Crossbell Data</p>
                      <p className="text-zinc-500 my-4 text-lg">
                        Thinking of leaving or backing up? Pack all your xLog
                        site data and interaction data in one click here
                      </p>
                      <Image
                        className="rounded-lg"
                        src="/integration3.png"
                        alt="integration3"
                        width="3726"
                        height="1888"
                      ></Image>
                    </UniLink>
                  </li>
                  <li>
                    <UniLink href="https://github.com/Crossbell-Box/crossbell.js">
                      <p className="font-bold text-xl">
                        Crossbell SDK and Indexer API
                      </p>
                      <p className="text-zinc-500 my-4 text-lg">
                        Create your own application or integration using
                        Crossbell&apos;s powerful SDK and Indexer API
                      </p>
                      <Image
                        className="rounded-lg"
                        src="/integration4.png"
                        alt="integration4"
                        width="3726"
                        height="1888"
                      ></Image>
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
