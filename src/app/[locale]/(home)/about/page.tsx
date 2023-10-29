import Link from "next/link"
import { memo } from "react"
import { NextServerPageBaseParams } from "types/next"

import { Logo } from "~/components/common/Logo"
import { BlockNumber } from "~/components/home/BlockNumber"
import { default as OriginEntranceButton } from "~/components/home/EntranceButton"
import { Integration } from "~/components/home/Integrations"
import { ShowCase } from "~/components/home/Showcase"
import { Button } from "~/components/ui/Button"
import { Image } from "~/components/ui/Image"
import { CSB_SCAN, GITHUB_LINK } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { getTranslation, Trans } from "~/lib/i18n"
import { withLocale } from "~/lib/i18n/with-locale"

const Home = async (props: NextServerPageBaseParams) => {
  const { t, i18n } = await getTranslation("index")

  const EntranceButton = memo(function Button() {
    return (
      <OriginEntranceButton
        connectedContent={
          <>
            <span className="icon-[mingcute--grid-line] text-xl mr-2 inline-block"></span>
            <span>{t("Dashboard")}</span>
          </>
        }
        unconnectedContent={t("Get my xLog in 5 minutes")}
      />
    )
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

  return (
    <div>
      <div className="h-[calc(100vh-6rem)] w-full flex justify-center flex-col relative text-center">
        <h2 className="text-4xl sm:text-8xl font-bold mb-5">
          {features.map((feature) => (
            <span
              key={feature.title}
              className={`text-feature text-feature-${feature.title.toLocaleLowerCase()} inline-block sm:mr-1`}
            >
              {t(feature.title)}
              {t(".")}
            </span>
          ))}
        </h2>
        <h3 className="mt-3 sm:mt-5 text-zinc-800 text-2xl sm:text-4xl font-light">
          <Trans i18n={i18n} i18nKey="description" ns="index">
            An{" "}
            <a
              target="_blank"
              rel="nofollow noreferrer"
              className="underline decoration-2 text-green-400 font-medium"
              href={GITHUB_LINK}
            >
              open-source
            </a>{" "}
            creative community written on the{" "}
            <a
              target="_blank"
              rel="nofollow noreferrer"
              className="underline decoration-2 text-yellow-400 font-medium"
              href={CSB_SCAN}
            >
              blockchain
            </a>
            .
          </Trans>
        </h3>
        <div className="my-4 sm:my-12 flex items-center justify-center sm:flex-row flex-col">
          <EntranceButton />
          <Button
            className="text-accent h-10 sm:ml-4 mt-4 flex"
            size="2xl"
            variant="outline"
            variantColor="gradient"
          >
            <Link
              className="h-full flex items-center"
              href={withLocale("/", { pathLocale: props.params.locale })}
            >
              {t("Look at others'")}
            </Link>
          </Button>
        </div>
        <div className="text-center absolute bottom-4 sm:bottom-14 w-full flex items-center justify-center flex-col">
          <span className="mb-1 sm:mb-3">{t("Explore the xLog way")}</span>
          <Link
            href="#features"
            className="cursor-pointer inline-block icon-[mingcute--down-line] text-3xl"
          ></Link>
        </div>
      </div>
      <div>
        <div id="features">
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
                    i18n={i18n}
                    i18nKey={`features.${feature.title}.description`}
                    components={{
                      aown: (
                        <a
                          target="_blank"
                          rel="nofollow noreferrer"
                          className="underline"
                          href="https://github.com/Crossbell-Box/Crossbell-Contracts/wiki"
                        >
                          .
                        </a>
                      ),
                    }}
                    ns="index"
                  />
                </p>
              </div>
              <ul className="pt-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
                {feature.subfeatures.map((item) => (
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
                        i18n={i18n}
                        i18nKey={`${item.title} text`}
                        components={{
                          strong: <strong className="font-bold" />,
                          axfm: (
                            <a
                              target="_blank"
                              rel="nofollow noreferrer"
                              className="underline"
                              href={`${getSiteLink({
                                subdomain: "xlog",
                              })}/xfm`}
                            >
                              .
                            </a>
                          ),
                          aincentive: (
                            <a
                              target="_blank"
                              rel="nofollow noreferrer"
                              className="underline"
                              href={`${getSiteLink({
                                subdomain: "xlog",
                              })}/creator-incentive-plan`}
                            >
                              .
                            </a>
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
                  <BlockNumber />
                  <a
                    target="_blank"
                    href={getSiteLink({ subdomain: "xlog" })}
                    role="button"
                    className="button is-black rounded-lg"
                    rel="noreferrer"
                  >
                    {t(`features.${feature.title}.extra.button`)}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
        <div id="showcase" className="text-center">
          <div className="pt-32 text-5xl sm:text-6xl font-bold">
            {t("Showcase")}
          </div>
          <div className="my-10 text-zinc-700">
            <p className="text-lg">
              {t(
                "Discover these awesome teams and creators on xLog (sorted by update time)",
              )}
            </p>
            <ShowCase />
          </div>
        </div>
        <div id="integration" className="text-center">
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
              <Integration />
              <li className="flex items-center justify-center">
                <i className="icon-[mingcute--more-1-line] text-5xl" />
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="my-20 text-center">
        <div className="w-[100px] h-[100px] mx-auto mb-10">
          <Logo type="lottie" width={100} height={100} loop={true} />
        </div>
        <EntranceButton />
      </div>
    </div>
  )
}

export default Home
