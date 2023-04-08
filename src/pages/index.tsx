import { GetServerSideProps } from "next"
import { ReactElement, useState } from "react"
import { MainLayout } from "~/components/main/MainLayout"
import { UniLink } from "~/components/ui/UniLink"
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
import showcase from "../../data/showcase.json"
import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { useAccountSites, useSubscribeToSites } from "~/queries/site"
import { RssIcon } from "@heroicons/react/24/outline"
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
import { Logo } from "~/components/common/Logo"

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

function Home() {
  const isConnected = useAccountState((s) => !!s.computed.account)
  const router = useRouter()
  const showcaseSites = useGetSites(showcase)
  const { t } = useTranslation("index")

  const tryNow = useConnectedAction(() => {
    router.push("/dashboard")
  })

  const features: {
    title: string
    subfeatures: {
      screenshot?: {
        src: string
      }
      icon: string
      title: string
    }[]
    extra?: boolean
  }[] = [
    {
      title: "Write",
      subfeatures: [
        {
          screenshot: {
            src: "/assets/easy.png",
          },
          icon: "🤪",
          title: "Easy to get started",
        },
        {
          screenshot: {
            src: "/assets/experience.png",
          },
          icon: "😆",
          title: "Elegant experience",
        },
        {
          screenshot: {
            src: "/assets/fast.png",
          },
          icon: "🚀",
          title: "Fast",
        },
      ],
    },
    {
      title: "Own",
      subfeatures: [
        {
          screenshot: {
            src: "/assets/safe.png",
          },
          icon: "🔒",
          title: "Safe",
        },
        {
          screenshot: {
            src: "/assets/customizable.png",
          },
          icon: "🎨",
          title: "Customizable",
        },
        {
          screenshot: {
            src: "/assets/open.png",
          },
          icon: "🌐",
          title: "Open",
        },
      ],
      extra: true,
    },
    {
      title: "Earn",
      subfeatures: [
        {
          icon: "🪙",
          title: "Creator Incentives",
        },
        {
          icon: "🏟️",
          title: "DAO",
        },
      ],
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
    {
      name: "Obsidian",
      icon: (
        <Image
          src="/assets/obsidian.svg"
          alt="Obsidian"
          className="rounded"
          fill
        />
      ),
      text: "Coming soon",
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
    <div className="max-w-screen-lg px-5 mx-auto">
      <div className="h-screen w-full flex justify-center flex-col relative text-center">
        <h2 className="text-6xl sm:text-8xl font-bold mb-5">
          {features.map((feature) => (
            <span
              key={feature.title}
              className={`text-feature text-feature-${feature.title.toLocaleLowerCase()} block sm:inline-block sm:mr-1 mb-2`}
            >
              {t(feature.title)}
              {t(".")}
            </span>
          ))}
        </h2>
        <h3 className="mt-3 sm:mt-5 text-zinc-800 text-2xl sm:text-4xl font-light">
          <Trans i18nKey="description" ns="index">
            <strong className="font-medium">xLog</strong> is the best{" "}
            <UniLink
              className="underline decoration-2 text-yellow-400 font-medium"
              href={CSB_SCAN}
            >
              on-chain
            </UniLink>{" "}
            and{" "}
            <UniLink
              className="underline decoration-2 text-green-400 font-medium"
              href={GITHUB_LINK}
            >
              open-source
            </UniLink>{" "}
            blogging community for everyone.
          </Trans>
        </h3>
        <div className="my-4 sm:my-12 flex items-center justify-center sm:flex-row flex-col">
          <Button
            className="text-accent h-10 mt-4 flex items-center"
            onClick={tryNow}
            size="2xl"
            variantColor="black"
          >
            {isConnected ? (
              <>
                <span className="i-mingcute-grid-line text-xl mr-2 inline-block"></span>
                <span>{t("Dashboard")}</span>
              </>
            ) : (
              t("Get my xLog in 5 minutes")
            )}
          </Button>
          <Button
            className="text-accent h-10 sm:ml-4 mt-4 flex"
            size="2xl"
            variant="outline"
            variantColor="gradient"
          >
            <span>
              <UniLink href="/activities">{t("Look at others'")}</UniLink>
            </span>
          </Button>
        </div>
        <div className="text-center absolute bottom-4 sm:bottom-14 w-full flex items-center justify-center flex-col">
          <span className="mb-1 sm:mb-3">{t("Explore the xLog way")}</span>
          <Link
            to="Features"
            spy={true}
            smooth={true}
            duration={500}
            className="cursor-pointer inline-block i-mingcute:down-line text-3xl"
          ></Link>
        </div>
      </div>
      <div>
        <Element name="Features">
          {features.map((feature, index) => (
            <div className="text-center mt-28" key={feature.title}>
              <div className="">
                <div
                  className={`h-20 w-[1px] bg-gradient-to-b mx-auto text-feature-${feature.title.toLocaleLowerCase()}`}
                  style={
                    {
                      "--tw-gradient-from": "transparent",
                    } as any
                  }
                ></div>
                <div
                  className={`block rounded-full w-10 h-10 mx-auto p-2 text-white bg-gradient-to-br text-feature-${feature.title.toLocaleLowerCase()}`}
                >
                  {index + 1}
                </div>
                <h3
                  className={`mt-6 inline-block text-3xl font-bold text-feature text-feature-${feature.title.toLocaleLowerCase()}`}
                >
                  {t(feature.title)}
                </h3>
                <h4 className="mt-6 text-5xl sm:text-6xl font-bold">
                  {t(`features.${feature.title}.subtitle`)}
                </h4>
                <p className="mt-6 text-zinc-500">
                  <Trans
                    i18nKey={`features.${feature.title}.description`}
                    components={{
                      aown: (
                        <UniLink
                          className="underline"
                          href="https://github.com/Crossbell-Box/Crossbell-Contracts/wiki"
                        >
                          .
                        </UniLink>
                      ),
                    }}
                    ns="index"
                  />
                </p>
              </div>
              <ul className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
                {feature.subfeatures.map((item, index) => (
                  <li
                    className="border rounded-xl overflow-hidden bg-white hover:shadow-md hover:scale-105 transition duration-300 cursor-default"
                    key={item.title}
                  >
                    {item.screenshot?.src && (
                      <div className="w-full h-44">
                        <Image
                          className="object-cover"
                          src={item.screenshot.src}
                          alt={item.title}
                          fill
                        ></Image>
                      </div>
                    )}
                    <p className="text-2xl font-bold mt-5 flex items-center px-5">
                      <span className="mr-3">{item.icon}</span>
                      <span
                        className={`text-feature text-feature-${feature.title.toLocaleLowerCase()}`}
                      >
                        {t(item.title)}
                      </span>
                    </p>
                    <p className="text-base font-light mt-3 mb-4 leading-normal px-5 text-left">
                      <Trans
                        i18nKey={`${item.title} text`}
                        components={{
                          strong: <strong className="font-bold" />,
                          axfm: (
                            <UniLink
                              className="underline"
                              href={`${getSiteLink({
                                subdomain: "xlog",
                              })}/xfm`}
                            >
                              .
                            </UniLink>
                          ),
                          aincentive: (
                            <UniLink
                              className="underline"
                              href={`${getSiteLink({
                                subdomain: "xlog",
                              })}/creator-incentive-plan`}
                            >
                              .
                            </UniLink>
                          ),
                        }}
                        ns="index"
                      />
                    </p>
                  </li>
                ))}
              </ul>
              {feature.extra && (
                <div className="border rounded-xl overflow-hidden bg-white hover:shadow-md hover:scale-105 transition duration-300 cursor-default mt-10 px-5 py-8 space-y-4">
                  <div className="font-bold text-3xl">
                    🤫{" "}
                    <span
                      className={`text-feature text-feature-${feature.title.toLocaleLowerCase()}`}
                    >
                      {t(`features.${feature.title}.extra.title`)}
                    </span>
                  </div>
                  <div>{t(`features.${feature.title}.extra.description`)}</div>
                  <Button
                    variantColor="black"
                    onClick={() =>
                      window.open(
                        getSiteLink({
                          subdomain: "xlog",
                        }),
                      )
                    }
                  >
                    {t(`features.${feature.title}.extra.button`)}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </Element>
        <Element name="Showcase" className="text-center">
          <div className="pt-32 text-5xl sm:text-6xl font-bold">
            {t("Showcase")}
          </div>
          <div className="my-10 text-zinc-700">
            <p className="text-lg">
              {t(
                "Discover these awesome teams and creators on xLog (sorted by update time)",
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
              isDisabled={subscribeToSites.isSuccess}
            >
              🥳{" "}
              {subscribeToSites.isSuccess
                ? t("Already Followed All!")
                : t("Follow All!")}
            </Button>
            <ul
              className={`pt-10 grid grid-cols-2 md:grid-cols-3 gap-10 overflow-y-hidden relative text-left ${
                showcaseMore ? "" : "max-h-[540px]"
              }`}
            >
              <div
                className={`absolute bottom-0 h-20 left-0 right-0 bg-gradient-to-t from-white via-white flex items-end justify-center font-bold cursor-pointer ${
                  showcaseMore ? "hidden" : ""
                }`}
                onClick={() => setShowcaseMore(true)}
              >
                {t("Show more")}
              </div>
              {showcaseSites.data?.map((site: any) => (
                <li className="inline-flex align-middle" key={site.handle}>
                  <UniLink
                    href={getSiteLink({
                      subdomain: site.handle,
                    })}
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
            </ul>
          </div>
        </Element>
        <Element name="Integration" className="text-center">
          <div className="pt-32 text-5xl sm:text-6xl font-bold">
            {t("Integration")}
          </div>
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
                <i className="i-mingcute:more-1-line text-5xl" />
              </li>
            </ul>
          </div>
        </Element>
      </div>
      <div className="my-20 text-center">
        <div className="w-[100px] h-[100px] mx-auto mb-10">
          <Logo type="lottie" width={100} height={100} loop={true} />
        </div>
        {isConnected ? (
          <UniLink
            href="/dashboard"
            className="text-accent inline-flex items-center space-x-2"
          >
            <Button size="2xl" variantColor="black">
              {t("Get my xLog in 5 minutes")}
            </Button>
          </UniLink>
        ) : (
          <Button onClick={tryNow} size="2xl" variantColor="black">
            {t("Get my xLog in 5 minutes")}
          </Button>
        )}
      </div>
    </div>
  )
}

Home.getLayout = (page: ReactElement) => {
  return <MainLayout>{page}</MainLayout>
}

export default Home
