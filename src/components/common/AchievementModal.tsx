import { Modal, Stepper } from "@mantine/core"
import type { AchievementSection } from "~/models/site.model"
import { Image } from "~/components/ui/Image"
import Tilt from "react-parallax-tilt"
import { Badge } from "~/components/common/AchievementItem"
import { Button } from "~/components/ui/Button"
import { useMintAchievement } from "~/queries/site"
import { useRouter } from "next/router"
import { BlockchainIcon } from "~/components/icons/BlockchainIcon"
import { useDate } from "~/hooks/useDate"
import { useTranslation } from "next-i18next"
import { cn } from "~/lib/utils"

export const AchievementModal: React.FC<{
  opened: boolean
  setOpened: (value: boolean) => void
  group: AchievementSection["groups"][number]
  layoutId: string
  isOwner: boolean
  characterId?: string
}> = ({ opened, setOpened, group, layoutId, isOwner, characterId }) => {
  const date = useDate()
  const { t } = useTranslation("common")

  const achievement = group.items
    .filter((item) => item.status === "MINTED")
    .pop()

  const achievementMintable = isOwner
    ? group.items.filter((item) => item.status === "MINTABLE").pop()
    : null

  const achievementComming = isOwner
    ? group.items.filter((item) => item.status === "COMMING").pop()
    : null

  const mintAchievement = useMintAchievement()

  const mint = async (tokenId: number) => {
    if (characterId) {
      await mintAchievement.mutate({
        characterId,
        achievementId: tokenId,
      })
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      centered
      size="auto"
      transitionProps={{
        duration: 200,
      }}
      overlayProps={{
        opacity: 0.5,
      }}
      shadow="none"
      withCloseButton={false}
      styles={{
        content: {
          background: "none",
          boxShadow: "none",
        },
      }}
    >
      <div
        className="flex items-center flex-col"
        onClick={() => setOpened(false)}
      >
        <div
          className="inline-flex flex-col text-center items-center text-white"
          key={
            (achievement || achievementMintable || achievementComming)!.info
              .name
          }
        >
          <Tilt
            className={`inline-block w-80 h-80 relative rounded-full bg-white mb-4 preserve-3d shadow-[inset_#a8a29e_34px_-34px_74px] p-[4%] ${
              !achievement && "grayscale"
            }`}
            trackOnWindow={true}
            perspective={500}
            tiltAngleXInitial={10}
            tiltAngleYInitial={-10}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <Image
              fill
              alt="achievement"
              src={
                (achievement || achievementMintable || achievementComming)!.info
                  .media
              }
              className="relative w-full h-full"
              style={{
                transform: "translateZ(20px)",
              }}
            />
          </Tilt>
          <div className="inline-flex flex-col flex-1 min-w-0 w-full space-y-1">
            <span className="capitalize text-black text-4xl font-medium truncate">
              {group.info.title} {achievement && `#${achievement.tokenId}`}
            </span>
            <span className="text-lg text-black capitalize truncate">
              {
                (achievement || achievementMintable || achievementComming)!.info
                  .description
              }
            </span>
            <span className="text-gray-300 leading-snug flex items-center justify-center">
              {achievement ? (
                <>
                  {t("obtained ago", {
                    time: date.dayjs
                      .duration(
                        date
                          .dayjs(achievement.mintedAt)
                          .diff(date.dayjs(), "minute"),
                        "minute",
                      )
                      .humanize(),
                  })}
                  <span
                    className="inline-flex items-center ml-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(
                        `https://scan.crossbell.io/tx/${achievement.transactionHash}`,
                      )
                    }}
                  >
                    <BlockchainIcon className="inline fill-gray-300 cursor-pointer" />
                  </span>
                </>
              ) : (
                t(achievementMintable ? "Mintable" : "Comming soon")
              )}
            </span>
          </div>
        </div>
        <div className="mt-8 hidden sm:block h-24">
          <Stepper
            active={
              group.items.findLastIndex((item) => item.status === "MINTED") + 1
            }
            color="var(--theme-color)"
            size="sm"
            iconSize={42}
            styles={(theme) => ({
              stepLabel: {
                color: "#fff",
                textTransform: "capitalize",
              },
              stepDescription: {
                color: "#e5e7eb",
                marginBottom: "0",
                height: "25px",
                overflow: "visible",
              },
              separator: {
                minWidth: "30px",
                marginLeft: "4px",
                marginRight: "12px",
              },
              stepBody: {
                maxWidth: "80px",
              },
              stepIcon: {
                border: "none",
              },
            })}
          >
            {group.items.map((item) => {
              const icon = (
                <>
                  <div
                    className={cn("text-[0px]", {
                      grayscale: item.status !== "MINTED",
                    })}
                  >
                    <Badge media={item.info.media} size={42} />
                  </div>
                  {item.status === "MINTABLE" && isOwner && (
                    <Button
                      className="absolute -bottom-10"
                      size="sm"
                      variant="primary"
                      rounded="full"
                      onClick={(e) => {
                        e.stopPropagation()
                        mint(item.info.tokenId)
                      }}
                      isLoading={mintAchievement.isLoading}
                    >
                      Mint
                    </Button>
                  )}
                </>
              )
              return (
                <Stepper.Step
                  icon={icon}
                  completedIcon={icon}
                  label={
                    item.info.attributes.find(
                      (attr) => attr.trait_type === "tier",
                    )?.value || item.name
                  }
                  description={item.info.description}
                  key={item.tokenId}
                />
              )
            })}
          </Stepper>
        </div>
      </div>
    </Modal>
  )
}
