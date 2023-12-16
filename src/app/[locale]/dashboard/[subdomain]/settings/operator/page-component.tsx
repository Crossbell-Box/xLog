"use client"

import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

import {
  useAccountState,
  useUpgradeEmailAccountModal,
} from "@crossbell/connect-kit"
import { Dialog } from "@headlessui/react"

import { CharacterCard } from "~/components/common/CharacterCard"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { UniLink } from "~/components/ui/UniLink"
import { useUserRole } from "~/hooks/useUserRole"
import { getSiteLink } from "~/lib/helpers"
import {
  useAddOperator,
  useGetOperators,
  useGetSite,
  useRemoveOperator,
} from "~/queries/site"

type RemoveItem = (operator: string) => void

const SortableNavigationItem = ({
  item,
  removeItem,
  isLoading,
  disabled,
}: {
  item: string
  removeItem: RemoveItem
  isLoading: boolean
  disabled?: boolean
}) => {
  const t = useTranslations()
  return (
    <div className="flex space-x-5 border-b p-5 bg-zinc-50 last:border-0 items-center">
      <div className="text-sm space-y-4">
        <div>
          {t("Address")}: {item}
        </div>
        <div>{t("Character")}:</div>
        <CharacterCard
          address={item}
          open={true}
          hideFollowButton={true}
          style="flat"
        />
      </div>
      <div className="flex items-end relative top-[-5px]">
        <Button
          onClick={() => removeItem(item)}
          variantColor="red"
          isLoading={isLoading}
          isDisabled={disabled}
        >
          {t("Remove")}
        </Button>
      </div>
    </div>
  )
}

export default function SettingsOperatorPage() {
  const params = useParams()
  const subdomain = params?.subdomain as string

  const addOperator = useAddOperator()
  const removeOperator = useRemoveOperator()
  const site = useGetSite(subdomain)
  const operators = useGetOperators({
    characterId: site.data?.characterId,
  })
  const isEmailAccount = useAccountState(
    (s) => s.computed.account?.type === "email",
  )
  const upgradeAccountModal = useUpgradeEmailAccountModal()
  const userRole = useUserRole(subdomain)
  const t = useTranslations()

  const [items, setItems] = useState<string[]>([])

  const newEmptyItem = () => {
    setIsOpen(true)
    setAddress("")
  }

  useEffect(() => {
    if (addOperator.isSuccess) {
      toast.success("Operator added")
    } else if (addOperator.isError) {
      toast.error("Failed to add operator")
    }
    setIsOpen(false)
  }, [addOperator.isSuccess, addOperator.isError])

  useEffect(() => {
    if (removeOperator.isSuccess) {
      toast.success("Operator removed")
    } else if (removeOperator.isError) {
      toast.error("Failed to remove operator")
    }
  }, [removeOperator.isSuccess, removeOperator.isError])

  const removeItem: RemoveItem = (operator) => {
    removeOperator.mutate({
      characterId: site.data?.characterId,
      operator: operator,
    })
  }
  const addItem = () => {
    if (address) {
      addOperator.mutate({
        characterId: site.data?.characterId,
        operator: address,
      })
    }
  }

  useEffect(() => {
    setItems(operators.data?.list.map((o) => o.operator) || [])
  }, [operators.data])

  const [isOpen, setIsOpen] = useState(false)
  const [address, setAddress] = useState("")

  return (
    <SettingsLayout title="Site Settings">
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-md w-full mx-auto">
            <Dialog.Title className="px-5 h-12 flex items-center border-b">
              {t("New operator")}
            </Dialog.Title>

            <div className="p-5">
              <Input
                className="w-full"
                label={t("Operator Address") || ""}
                required
                onChange={(e) => {
                  setAddress(e.target.value)
                }}
              />
              <div className="form-label mt-5">
                {t("Operator Character Check")}
              </div>
              <div>
                <CharacterCard
                  address={address}
                  open={true}
                  hideFollowButton={true}
                  style="flat"
                />
              </div>
            </div>

            <div className="h-16 border-t flex items-center px-5">
              <Button
                isLoading={addOperator.isLoading}
                isDisabled={!address}
                onClick={addItem}
              >
                {t("Save")}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
      <div className="p-5 text-zinc-500 bg-orange-50 mb-5 rounded-lg text-sm space-y-2">
        <p className="text-zinc-800 text-sm font-bold">⚠️ {t("Warning")}:</p>
        <p>
          <span className="text-zinc-800">
            {isEmailAccount && (
              <span>
                Email users cannot set operators.{" "}
                <UniLink
                  className="underline"
                  href={
                    getSiteLink({
                      subdomain: "crossbell-blog",
                    }) + "/newbie-villa"
                  }
                >
                  Learn more
                </UniLink>{" "}
                or{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={upgradeAccountModal.show}
                >
                  upgrade account
                </span>
                .
              </span>
            )}
            {userRole.data === "operator" && (
              <span>
                Operators cannot set other operators. Please contact the site
                owner.
              </span>
            )}
            {!isEmailAccount && userRole.data !== "operator" && (
              <span>
                {t(
                  "Operators have permissions to enter your dashboard, change your settings(excluding xLog subdomain) and post, modify, delete contents on your site",
                )}
              </span>
            )}
          </span>
        </p>
      </div>
      <div
        className={
          isEmailAccount || userRole.data === "operator"
            ? `grayscale cursor-not-allowed`
            : ""
        }
      >
        <div className="bg-zinc-50 rounded-lg overflow-hidden">
          {items.length === 0 && (
            <div className="text-center text-zinc-500 p-5">
              No operators yet
            </div>
          )}
          {items.map((item, index) => {
            return (
              <SortableNavigationItem
                key={index}
                item={item}
                removeItem={removeItem}
                isLoading={removeOperator.isLoading}
                disabled={isEmailAccount || userRole.data === "operator"}
              />
            )
          })}
          {/* eslint-disable-next-line react/no-unknown-property */}
          <style jsx global>{`
            .sortable-ghost {
              opacity: 0.4;
            }
          `}</style>
        </div>
        <div className="border-t pt-5 mt-10 space-x-3 flex items-center">
          <Button
            onClick={newEmptyItem}
            isDisabled={isEmailAccount || userRole.data === "operator"}
          >
            {t("Add")}
          </Button>
        </div>
      </div>
    </SettingsLayout>
  )
}
