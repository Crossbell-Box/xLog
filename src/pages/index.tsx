import { GetServerSideProps } from "next"
import { useState } from "react"
import { DashboardIcon } from "~/components/icons/DashboardIcon"
import { MainLayout } from "~/components/main/MainLayout"
import { UniLink } from "~/components/ui/UniLink"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { LaughIcon } from "~/components/icons/LaughIcon"
import { Button } from "~/components/ui/Button"
import { useAccountState, useConnectedAction } from "@crossbell/connect-kit"
import { useRefCallback } from "@crossbell/util-hooks"
import { useRouter } from "next/router"
import { GITHUB_LINK, APP_NAME, CSB_SCAN, OUR_DOMAIN } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { Link, Element } from "react-scroll"
import { Image } from "~/components/ui/Image"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { prefetchGetSites } from "~/queries/site.server"
import { useGetSites } from "~/queries/site"
import showcase from "../../showcase.json"
import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { useAccountSites, useSubscribeToSites } from "~/queries/site"
import {
  BoltIcon,
  FingerPrintIcon,
  RssIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline"
import { Tooltip } from "~/components/ui/Tooltip"
import {
  XCharLogo,
  XFeedLogo,
  XSyncLogo,
  XShopLogo,
  CrossbellChainLogo,
} from "@crossbell/ui"
import { useTranslation, Trans } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { languageDetector } from "~/lib/language-detector"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  await prefetchGetSites(showcase, queryClient)

  return {
    props: {
      ...(await serverSideTranslations(languageDetector(ctx), [
        "common",
        "index",
      ])),
      dehydratedState: dehydrate(queryClient),
    },
  }
}

export default function Home() {
  const isConnected = useAccountState((s) => !!s.computed.account)
  const router = useRouter()
  const showcaseSites = useGetSites(showcase)
  const { t } = useTranslation("index")

  const tryNow = useConnectedAction(() => {
    router.push("/dashboard")
  })

  const features = [
    {
      screenshot: {
        src: "/assets/easy.png",
      },
      icon: <LaughIcon />,
      title: "Easy",
      text: "Connect with your <strong>Web3 Wallet</strong> or <strong>Email</strong>. Build your own site with custom domains, subscriptions, likes, comments, minting as nft, RSS and more in one second. No fees, no friction.",
    },
    {
      screenshot: {
        src: "/assets/safe.png",
      },
      icon: <FingerPrintIcon className="w-7 h-7" />,
      title: "Safe",
      text: "All blog data, including configs, posts, subscriptions, comments, etc., are signed and securely stored on the <strong>blockchain</strong> with your own hands. No one else, including us, can make any changes.",
    },
    {
      screenshot: {
        src: "/assets/fast.png",
      },
      icon: <BoltIcon className="w-7 h-7" />,
      title: "Fast",
      text: "Blockchain doesn't always mean inefficiency. xLog's efficient caching mechanism and numerous optimisations take it to the peak of performance.",
    },
    {
      screenshot: {
        src: "/assets/customizable.png",
      },
      icon: <DashboardIcon />,
      title: "Customizable",
      text: "Use your own <strong>domain</strong>, customise your site and <strong>style</strong> it however you like. This is your site, there are no restrictions.",
    },
    {
      screenshot: {
        src: "/assets/open.png",
      },
      icon: <BlockchainIcon className="w-6 h-6" />,
      title: "Open",
      text: "Uses standard <strong>Markdown</strong> with export and import tools and rich APIs for a painless move in and out. All code is <strong>open source</strong> on GitHub, all <strong>data is transparent</strong> on the chain.",
    },
  ]

  const integrations = [
    {
      name: "RSS",
      icon: <RssIcon className="w-full h-full text-orange-500" />,
      url:
        getSiteLink({
          subdomain: "xlog",
        }) + "/feed/xml",
    },
    {
      name: "JSON Feed",
      icon: <Image src="/assets/json-feed.png" alt="JSON Feed" />,
      url:
        getSiteLink({
          subdomain: "xlog",
        }) + "/feed",
    },
    {
      name: "xChar",
      icon: <XCharLogo className="w-full h-full" />,
      url: "https://xchar.app/",
    },
    {
      name: "xFeed",
      icon: <XFeedLogo className="w-full h-full" />,
      url: "https://crossbell.io/feed",
    },
    {
      name: "xSync",
      icon: <XSyncLogo className="w-full h-full" />,
      url: "https://xsync.app/",
    },
    {
      name: "xShop",
      icon: <XShopLogo className="w-full h-full" />,
      text: "Coming soon",
    },
    {
      name: "Crossbell Scan",
      icon: <CrossbellChainLogo className="w-full h-full text-[#E7B75B]" />,
      url: "https://scan.crossbell.io/",
    },
    {
      name: "Crossbell Faucet",
      icon: <CrossbellChainLogo className="w-full h-full text-[#E7B75B]" />,
      url: "https://faucet.crossbell.io/",
    },
    {
      name: "Crossbell Export",
      icon: <CrossbellChainLogo className="w-full h-full text-[#E7B75B]" />,
      url: "https://export.crossbell.io/",
    },
    {
      name: "Crossbell SDK",
      icon: <CrossbellChainLogo className="w-full h-full text-[#E7B75B]" />,
      url: "https://crossbell-box.github.io/crossbell.js/",
    },
    {
      name: "RSS3",
      icon: (
        <Image alt="RSS3" src="/assets/rss3.svg" className="rounded" fill />
      ),
      url: "https://rss3.io/",
    },
    {
      name: "Hoot It",
      icon: (
        <Image alt="Hoot It" src="/assets/hoot.svg" className="rounded" fill />
      ),
      url: "https://hoot.it/search/xLog",
    },
    {
      name: "Unidata",
      icon: <Image src="/assets/unidata.png" alt="Unidata" />,
      url: "https://unidata.app/",
    },
    {
      name: "Raycast",
      icon: <Image src="/assets/raycast.png" alt="Raycast" />,
      url: "https://www.raycast.com/Songkeys/crossbell",
    },
  ]

  const userSite = useAccountSites()
  const subscribeToSites = useSubscribeToSites()

  const doSubscribeToSites = useRefCallback(() => {
    subscribeToSites.mutate({
      characterIds: showcaseSites.data
        ?.map((s: { characterId?: string }) => s.characterId)
        .filter(Boolean)
        .map(Number),
      siteIds: showcaseSites.data?.map((s: { handle: string }) => s.handle),
    } as any)
  })

  const followAll = useConnectedAction(() => {
    doSubscribeToSites()
  })

  const [showcaseMore, setShowcaseMore] = useState(false)

  return (
    <MainLayout tabs={["Features", "Showcase", "Integration"]}>
      <section>
        <div className="max-w-screen-lg px-5 mx-auto">
          <div className="h-screen w-full flex justify-center flex-col relative">
            <div className="w-28 h-28 mb-16">
              <Image
                alt="logo"
                src="/assets/logo.svg"
                width={200}
                height={200}
              />
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold mb-5">
              {t("Blog Free")}
            </h2>
            <h3 className="mt-5 text-zinc-800 text-4xl sm:text-6xl font-light">
              <Trans i18nKey="description" ns="index">
                xLog, the first{" "}
                <UniLink className="underline decoration-2" href={CSB_SCAN}>
                  on-chain
                </UniLink>{" "}
                and{" "}
                <UniLink className="underline decoration-2" href={GITHUB_LINK}>
                  open-source
                </UniLink>{" "}
                blogging platform for everyone.
              </Trans>
            </h3>
            <div className="my-10 sm:my-16">
              <Button
                className="text-accent w-80 h-10"
                onClick={tryNow}
                size="xl"
              >
                {isConnected ? (
                  <>
                    <span className="i-bi-grid text-lg mr-2"></span>
                    <span>{t("Dashboard")}</span>
                  </>
                ) : (
                  t("Get my xLog in 5 minutes")
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
              <UniLink
                className="underline pt-28 w-full"
                href={getSiteLink({
                  subdomain: "xlog",
                })}
              >
                <Image
                  src="/assets/overall.png"
                  alt="overall"
                  width={3785}
                  height={2170}
                ></Image>
                <p className="text-center">
                  {t("Visit")} xlog.{OUR_DOMAIN}
                </p>
              </UniLink>
              <ul className="pt-20 grid grid-cols-1 sm:grid-cols-3 gap-8">
                {features.map((item, index) => (
                  <li
                    className="border rounded-xl overflow-hidden bg-white hover:shadow-md hover:scale-105 transition duration-300 cursor-default"
                    key={item.title}
                  >
                    <div className="w-full h-44">
                      <Image
                        className="object-cover"
                        src={item.screenshot.src}
                        alt={item.title}
                        fill
                      ></Image>
                    </div>
                    <p className="text-2xl font-bold mt-5 flex items-center px-5">
                      <span className="mr-3">{item.icon}</span>
                      <span>{t(item.title)}</span>
                    </p>
                    <p className="text-base font-light mt-3 mb-4 leading-normal px-5">
                      <Trans
                        i18nKey={`${item.title} description`}
                        defaults={item.text}
                        components={{
                          strong: <strong className="font-bold" />,
                        }}
                        ns="index"
                      />
                    </p>
                  </li>
                ))}
              </ul>
            </Element>
            <Element name="Showcase">
              <div className="pt-28 text-4xl font-bold">{t("Showcase")}</div>
              <div className="my-10 text-zinc-700">
                <p className="text-lg">
                  {t(
                    "Discover these awesome teams and geeks on xLog (sorted by update time)",
                  )}
                </p>
                <Button
                  size="xl"
                  className="mt-5"
                  onClick={followAll}
                  isLoading={
                    showcaseSites.isLoading ||
                    userSite.isLoading ||
                    subscribeToSites.isLoading
                  }
                >
                  🥳 {t("Follow All!")}
                </Button>
                <ul
                  className={`pt-10 grid grid-cols-2 md:grid-cols-3 gap-10 overflow-y-hidden relative ${
                    showcaseMore ? "" : "max-h-[540px]"
                  }`}
                >
                  <div
                    className={`absolute bottom-0 h-20 left-0 right-0 bg-gradient-to-t from-white via-white z-40 flex items-end justify-center font-bold cursor-pointer ${
                      showcaseMore ? "hidden" : ""
                    }`}
                    onClick={() => setShowcaseMore(true)}
                  >
                    {t("Show more")}
                  </div>
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
                        <CharacterFloatCard siteId={site.handle}>
                          <span className="w-14 h-14 inline-block">
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
                      {t("Submit yours")}
                    </UniLink>
                  </li>
                </ul>
              </div>
            </Element>
            <Element name="Integration">
              <div className="pt-28 text-4xl font-bold">{t("Integration")}</div>
              <div className="my-10 text-zinc-700">
                <p className="text-xl">
                  {t(
                    "xLog's open design allows it to integrate with many other open protocols and applications without friction.",
                  )}
                </p>
                <ul className="mt-14 grid grid-cols-3 sm:grid-cols-5 gap-y-14 gap-x-2">
                  {integrations.map((item, index) => (
                    <li
                      className="hover:scale-105 transition-transform duration-300"
                      key={index}
                    >
                      {item.url ? (
                        <UniLink
                          href={item.url}
                          className="w-full flex items-center flex-col justify-center"
                        >
                          <div className="w-12 h-12 rounded-md overflow-hidden">
                            {item.icon}
                          </div>
                          <div className="font-medium sm:text-lg mt-2 text-center">
                            {item.name}
                          </div>
                        </UniLink>
                      ) : (
                        <Tooltip label={item.text!}>
                          <div className="w-full h-full flex items-center flex-col justify-center">
                            <div className="w-12 h-12 rounded-md overflow-hidden">
                              {item.icon}
                            </div>
                            <div className="font-medium sm:text-lg mt-2 text-center">
                              {item.name}
                            </div>
                          </div>
                        </Tooltip>
                      )}
                    </li>
                  ))}
                  <li className="flex items-center justify-center">
                    <EllipsisHorizontalIcon className="w-12 h-12" />
                  </li>
                </ul>
              </div>
            </Element>
          </div>
          <div className="my-20 text-center">
            <div className="w-20 h-20 mx-auto mb-8">
              <Image
                alt="logo"
                src="/assets/logo.svg"
                width={100}
                height={100}
              />
            </div>
            {isConnected ? (
              <UniLink
                href="/dashboard"
                className="text-accent inline-flex items-center space-x-2"
              >
                <Button size="xl">{t("Get my xLog in 5 minutes")}</Button>
              </UniLink>
            ) : (
              <Button onClick={tryNow} size="xl">
                {t("Get my xLog in 5 minutes")}
              </Button>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
