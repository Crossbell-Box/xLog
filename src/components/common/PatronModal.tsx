import { Button } from "~/components/ui/Button"
import { Profile } from "~/lib/types"
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

export const PatronModal: React.FC<{
  site: Profile | undefined | null
  open: boolean
  setOpen: (open: boolean) => void
}> = ({ site, open, setOpen }) => {
  const { t } = useTranslation("common")
  const tipCharacter = useTipCharacter()
  // const tips = useGetTips({
  //   toCharacterId: site?.metadata?.proof,
  // })
  // console.log(tips.data)

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
      }
    }
  }, [tipCharacter.isSuccess, t, site?.name])

  useEffect(() => {
    if (tipCharacter.isError) {
      toast.error(t("Failed to become a patron"))
    }
  }, [tipCharacter.isError, t])

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title={
        t("Become a patron to {{name}}", {
          name: site?.name,
        }) || ""
      }
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
        <div className="text-lg">{t("Current patrons")}</div>
        <div className="text-zinc-500 text-sm">
          {t("You are here to be the first patron.")}
        </div>
        <div className="text-lg">{t("Select a tier")}</div>
        <div>
          <Tabs
            items={[
              {
                text: "One-time",
                active: true,
              },
              {
                text: "Monthly and NFT Rewards",
                tooltip: "Coming soon",
              },
            ]}
          ></Tabs>
        </div>
        <div>
          <BoxRadio items={radios} value={value} setValue={setValue} />
        </div>
        <div className="text-zinc-500 text-xs space-y-2">
          <p>1 Mira ≈ 1 USDC</p>
          <p className="flex items-center">
            <QuestionMarkCircleIcon className="w-4 h-4 inline-block mr-1" />
            What is Mira? Where can I get some?
          </p>
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
            {t("Become a patron to {{name}}", {
              name: site?.name,
            })}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
