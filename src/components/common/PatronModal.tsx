import confetti from "canvas-confetti"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"

import { useConnectModal } from "@crossbell/connect-kit"

import { Avatar } from "~/components/ui/Avatar"
import { BoxRadio } from "~/components/ui/BoxRadio"
import { Button } from "~/components/ui/Button"
import { CSB_SCAN, MIRA_LINK } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { ExpandedCharacter, ExpandedNote } from "~/lib/types"
import { useGetTips, useTipCharacter } from "~/queries/site"

import { ModalContentProps, useModalStack } from "../ui/ModalStack"
import { Tabs } from "../ui/Tabs"
import { UniLink } from "../ui/UniLink"
import { CharacterFloatCard } from "./CharacterFloatCard"
import { Loading } from "./Loading"

export const usePatronModal = () => {
  const { present } = useModalStack()
  const t = useTranslations()
  return (site?: ExpandedCharacter, page?: ExpandedNote) => {
    const title =
      (page
        ? t("Tip the post: {name}", {
            name: page.metadata?.content?.title,
          })
        : t("Become a patron of {name}", {
            name: site?.metadata?.content?.name,
          })) || ""

    present({
      title: (
        <span className="inline-flex items-center justify-center w-full space-x-1">
          <span className="text-red-500 flex size-6 -mb-px">
            <i className="i-mingcute-heart-fill text-2xl -mb-px" />
          </span>
          <span className="truncate">{title}</span>
        </span>
      ),
      content: (props) => <PatronModal {...props} page={page} site={site} />,
      modalProps: {
        size: "lg",
      },
    })
  }
}
const PatronModal = ({
  site,
  page,
  dismiss,
}: ModalContentProps<{
  site?: ExpandedCharacter
  page?: ExpandedNote
}>) => {
  const t = useTranslations()
  const tipCharacter = useTipCharacter()
  const tips = useGetTips(
    page
      ? {
          toCharacterId: page?.characterId,
          toNoteId: page?.noteId,
        }
      : {
          toCharacterId: site?.characterId,
        },
  )
  const connectModal = useConnectModal()

  const radios = [
    {
      text: "🍭 1 MIRA",
      value: "1",
    },
    {
      text: "☕️ 5 MIRA",
      value: "5",
    },
    {
      text: "🍕 10 MIRA",
      value: "10",
    },
    {
      text: "🎁 50 MIRA",
      value: "50",
    },
    {
      text: "👑 100 MIRA",
      value: "100",
    },
    {
      text: "Custom",
    },
  ]

  const [value, setValue] = useState(radios[1].value!)

  const submit = () => {
    if (site?.characterId && parseInt(value)) {
      tipCharacter.mutate({
        characterId: site?.characterId,
        amount: parseInt(value),
        noteId: page?.noteId,
      })
    } else {
      dismiss()
      connectModal.show()
    }
  }

  const submitRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (tipCharacter.isSuccess) {
      if (submitRef.current?.getBoundingClientRect()) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: {
            x:
              (submitRef.current.getBoundingClientRect().left +
                submitRef.current.getBoundingClientRect().width / 2 || 0.5) /
              window.innerWidth,
            y:
              (submitRef.current.getBoundingClientRect().top || 0.5) /
              window.innerHeight,
          },
        })
        tipCharacter.reset()
      }
    }
  }, [tipCharacter.isSuccess, t])

  useEffect(() => {
    if (tipCharacter.isError) {
      toast.error(t("Failed to become a patron"))
      tipCharacter.reset()
    }
  }, [tipCharacter.isError, t])

  const title =
    (page
      ? t("Tip the post: {name}", {
          name: page.metadata?.content?.title,
        })
      : t("Become a patron of {name}", {
          name: site?.metadata?.content?.name,
        })) || ""

  return (
    <>
      <div className="px-5 py-4 space-y-4 text-center">
        <div className="space-y-1">
          <span className="flex items-center justify-center">
            <Avatar
              cid={site?.characterId}
              images={site?.metadata?.content?.avatars || []}
              name={site?.metadata?.content?.name}
              size={100}
            />
          </span>
          <span className="block">
            <span className="font-bold text-lg text-zinc-800">
              {site?.metadata?.content?.name}
            </span>
            <span className="ml-1 text-gray-600">@{site?.handle}</span>
          </span>
          {site?.metadata?.content?.bio && (
            <span className="text-gray-600 text-sm line-clamp-4">
              {site?.metadata?.content?.bio}
            </span>
          )}
        </div>
        <div>
          <div className="text-lg font-medium">
            {t(page ? "Latest tipper" : "Latest patrons")}
          </div>
          <div className="text-zinc-500 text-sm mt-2">
            {tips.isLoading ? (
              <Loading />
            ) : tips.data?.pages?.[0]?.list?.length ? (
              <>
                <ul className="flex items-center justify-center">
                  {tips.data.pages[0].list?.map((tip, index) => (
                    <li
                      className="inline-flex flex-col items-center w-[12.5%]"
                      key={index}
                    >
                      <div className="text-left">
                        <CharacterFloatCard siteId={tip.character?.handle}>
                          <UniLink
                            href={getSiteLink({
                              subdomain: tip.character?.handle || "",
                            })}
                          >
                            <Avatar
                              cid={tip.character?.characterId}
                              className="relative align-middle border-2 border-white"
                              images={
                                tip.character?.metadata?.content?.avatars || []
                              }
                              name={tip.character?.metadata?.content?.name}
                              size={50}
                            />
                          </UniLink>
                        </CharacterFloatCard>
                      </div>
                      <UniLink
                        href={`${CSB_SCAN}/tx/${tip.transactionHash}`}
                        className="inline-flex items-center mt-1 text-center w-full"
                      >
                        <span className="text-xs text-zinc-500 truncate w-full">
                          {tip.amount} MIRA
                        </span>
                      </UniLink>
                    </li>
                  ))}
                  {tips.data.pages?.[0]?.count > 7 && (
                    <li className="inline-flex justify-center w-[12.5%] h-[70px]">
                      <div className="relative align-middle size-[50px] rounded-full inline-flex bg-gray-100 items-center justify-center text-gray-400 font-medium">
                        +{tips.data.pages?.[0]?.count - 7}
                      </div>
                    </li>
                  )}
                </ul>
              </>
            ) : (
              t(
                page
                  ? "You are here to be the first tipper"
                  : "You are here to be the first patron",
              )
            )}
          </div>
        </div>
        <div>
          <div className="text-lg font-medium">{t("Select a tier")}</div>
          <div className="-mb-4">
            <Tabs
              items={[
                {
                  text: t("One-time"),
                  active: true,
                },
                {
                  text: t("Monthly and NFT Rewards"),
                  tooltip: t("Coming soon") || "",
                },
              ]}
              className="justify-center overflow-visible"
            ></Tabs>
          </div>
          <div>
            <BoxRadio items={radios} value={value} setValue={setValue} />
          </div>
          <div className="text-zinc-500 text-xs space-y-1 mt-2">
            <p className="flex items-center justify-center">
              <i className="i-mingcute-question-line mr-1 text-sm" />
              <UniLink href={MIRA_LINK}>
                {t("What is MIRA? Where can I get some?")}
              </UniLink>
            </p>
          </div>
        </div>
        <div>
          <Button
            variant="primary"
            className="w-full"
            onClick={submit}
            style={{
              height: "2.5rem",
            }}
            isLoading={tipCharacter.isLoading}
            ref={submitRef}
          >
            <span className="truncate">{title}</span>
          </Button>
        </div>
      </div>
    </>
  )
}
