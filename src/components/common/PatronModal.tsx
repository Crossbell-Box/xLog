import { Button } from "~/components/ui/Button"
import { Note, Profile } from "~/lib/types"
import { useTranslation } from "next-i18next"
import { HeartIcon } from "@heroicons/react/24/solid"
import { Modal } from "~/components/ui/Modal"
import { useEffect, useRef, useState } from "react"
import { BoxRadio } from "~/components/ui/BoxRadio"
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline"
import { Tabs } from "../ui/Tabs"
import { useTipCharacter, useGetTips } from "~/queries/site"
import { useAccountState } from "@crossbell/connect-kit"
import { toast } from "react-hot-toast"
import confetti from "canvas-confetti"
import { Avatar } from "~/components/ui/Avatar"
import { CharacterFloatCard } from "./CharacterFloatCard"
import { UniLink } from "../ui/UniLink"
import { getSiteLink } from "~/lib/helpers"
import { CSB_SCAN } from "~/lib/env"
import { parsePageId } from "~/models/page.model"

export const PatronModal: React.FC<{
  site: Profile | undefined | null
  page?: Note | null
  open: boolean
  setOpen: (open: boolean) => void
}> = ({ site, page, open, setOpen }) => {
  const { t } = useTranslation("common")
  const tipCharacter = useTipCharacter()
  const tips = useGetTips({
    toCharacterId: site?.metadata?.proof,
    toNoteId: parsePageId(page?.id || "").noteId,
  })

  const radios = [
    {
      text: "🍭 1 Mira",
      value: "1",
    },
    {
      text: "☕️ 5 Mira",
      value: "5",
    },
    {
      text: "🍕 10 Mira",
      value: "10",
    },
    {
      text: "🎁 50 Mira",
      value: "50",
    },
    {
      text: "👑 100 Mira",
      value: "100",
    },
    {
      text: "Custom",
    },
  ]

  const [value, setValue] = useState(radios[1].value!)

  const currentCharacterId = useAccountState(
    (s) => s.computed.account?.characterId,
  )

  const submit = () => {
    if (currentCharacterId && site?.metadata?.proof && parseInt(value)) {
      tipCharacter.mutate({
        fromCharacterId: currentCharacterId,
        toCharacterId: site?.metadata?.proof,
        amount: parseInt(value),
        noteId: parsePageId(page?.id || "").noteId,
      })
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
  }, [tipCharacter.isSuccess, t, site?.name])

  useEffect(() => {
    if (tipCharacter.isError) {
      toast.error(t("Failed to become a patron"))
      tipCharacter.reset()
    }
  }, [tipCharacter.isError, t])

  const title =
    (page
      ? t("Tip the post: {{name}}", {
          name: page.title,
        })
      : t("Become a patron of {{name}}", {
          name: site?.name,
        })) || ""

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title={title}
      titleIcon={<HeartIcon className="text-red-500 flex w-6 h-6 -mb-[1px]" />}
      size="lg"
    >
      <div className="px-5 py-4 space-y-4">
        <div className="space-y-1">
          <span className="flex items-center justify-between">
            <Avatar images={site?.avatars || []} name={site?.name} size={60} />
          </span>
          <span className="block">
            <span className="font-bold text-lg text-zinc-800">
              {site?.name}
            </span>
            <span className="ml-1 text-gray-600">@{site?.username}</span>
          </span>
          {site?.description && (
            <span
              className="block text-gray-600 text-sm"
              dangerouslySetInnerHTML={{ __html: site?.description || "" }}
            ></span>
          )}
        </div>
        <div>
          <div className="text-lg">
            {t(page ? "Latest tipper" : "Latest patrons")}
          </div>
          <div className="text-zinc-500 text-sm mt-2">
            {tips.data?.pages?.[0]?.list?.length ? (
              <>
                <ul className="grid grid-cols-5 sm:grid-cols-8">
                  {tips.data.pages[0].list?.map((tip, index) => (
                    <li
                      className="inline-flex flex-col items-center"
                      key={index}
                    >
                      <CharacterFloatCard siteId={tip.character?.handle}>
                        <UniLink
                          href={getSiteLink({
                            subdomain: tip.character?.handle || "",
                          })}
                        >
                          <Avatar
                            className="relative align-middle border-2 border-white"
                            images={
                              tip.character?.metadata?.content?.avatars || []
                            }
                            name={tip.character?.metadata?.content?.name}
                            size={50}
                          />
                        </UniLink>
                      </CharacterFloatCard>
                      <UniLink
                        href={`${CSB_SCAN}/tx/${tip.transactionHash}`}
                        className="inline-flex items-center mt-1 text-center w-full"
                      >
                        <span className="text-xs text-zinc-500 truncate w-full">
                          {tip.amount} Mira
                        </span>
                      </UniLink>
                    </li>
                  ))}
                  {tips.data.pages?.[0]?.count > 8 && (
                    <li className="inline-block">
                      <div className="relative align-middle border-2 border-white w-[55px] h-[55px] rounded-full inline-flex bg-gray-100 items-center justify-center text-gray-400 font-medium">
                        +{tips.data.pages?.[0]?.count - 8}
                      </div>
                    </li>
                  )}
                </ul>
              </>
            ) : (
              t(
                page
                  ? "You are here to be the first tipper."
                  : "You are here to be the first patron.",
              )
            )}
          </div>
        </div>
        <div>
          <div className="text-lg">{t("Select a tier")}</div>
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
            ></Tabs>
          </div>
          <div>
            <BoxRadio items={radios} value={value} setValue={setValue} />
          </div>
          <div className="text-zinc-500 text-xs space-y-1 mt-2">
            <p>1 Mira ≈ 1 USDC</p>
            <p className="flex items-center">
              <QuestionMarkCircleIcon className="w-4 h-4 inline-block mr-1" />
              {t("What is Mira? Where can I get some?")}
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
    </Modal>
  )
}
