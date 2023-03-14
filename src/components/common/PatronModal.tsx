import { Button } from "~/components/ui/Button"
import { Profile } from "~/lib/types"
import { useTranslation } from "next-i18next"
import { HeartIcon } from "@heroicons/react/24/solid"
import { cn } from "~/lib/utils"
import { Modal } from "~/components/ui/Modal"
import { useState } from "react"
import { BoxRadio } from "~/components/ui/BoxRadio"
import { CharacterCard } from "~/components/common/CharacterCard"
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline"
import { Tabs } from "../ui/Tabs"

export const PatronModal: React.FC<{
  site: Profile | undefined | null
  open: boolean
  setOpen: (open: boolean) => void
}> = ({ site, open, setOpen }) => {
  const { t } = useTranslation("common")

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

  const submit = () => {
    console.log(value)
  }

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
        <CharacterCard
          address={site?.metadata?.owner}
          open={true}
          hideFollowButton={true}
          simple={true}
          style="flat"
        />
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
          <Button variant="primary" className="w-full" onClick={submit}>
            {t("Become a patron to {{name}}", {
              name: site?.name,
            })}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
