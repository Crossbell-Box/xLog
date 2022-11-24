import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import {
  useGetSite,
  useGetOperators,
  useAddOperator,
  useRemoveOperator,
} from "~/queries/site"
import { Dialog } from "@headlessui/react"
import { CharacterCard } from "~/components/common/CharacterCard"

type RemoveItem = (operator: string) => void

const SortableNavigationItem: React.FC<{
  item: string
  removeItem: RemoveItem
  isLoading: boolean
}> = ({ item, removeItem, isLoading }) => {
  return (
    <div className="flex space-x-5 border-b p-5 bg-zinc-50 last:border-0 items-center">
      <div className="text-sm space-y-4">
        <div>Address: {item}</div>
        <div>Character:</div>
        <CharacterCard
          address={item}
          open={true}
          hideFollowButton={true}
          style="flat"
        />
      </div>
      <div className="flex items-end relative -top-[5px]">
        <Button
          onClick={() => removeItem(item)}
          variantColor="red"
          isLoading={isLoading}
        >
          Remove
        </Button>
      </div>
    </div>
  )
}

export default function SiteSettingsNavigationPage() {
  const router = useRouter()

  const subdomain = router.query.subdomain as string

  const addOperator = useAddOperator()
  const removeOperator = useRemoveOperator()
  const site = useGetSite(subdomain)
  const operators = useGetOperators({
    characterId: +(site.data?.metadata?.proof || 0),
  })

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
      characterId: +(site.data?.metadata?.proof || 0),
      operator: operator,
    })
  }
  const addItem = () => {
    if (address) {
      addOperator.mutate({
        characterId: +(site.data?.metadata?.proof || 0),
        operator: address,
      })
    }
  }

  useEffect(() => {
    setItems(operators.data || [])
  }, [operators.data])

  const [isOpen, setIsOpen] = useState(false)
  const [address, setAddress] = useState("")

  return (
    <DashboardLayout title="Navigation">
      <SettingsLayout title="Site Settings" type="site">
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="fixed z-10 inset-0 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

            <div className="relative bg-white rounded-lg max-w-md w-full mx-auto">
              <Dialog.Title className="px-5 h-12 flex items-center border-b">
                New operator
              </Dialog.Title>

              <div className="p-5">
                <Input
                  className="w-full"
                  label="Operator Address"
                  required
                  onChange={(e) => {
                    setAddress(e.target.value)
                  }}
                />
                <div className="form-label mt-5">Operator Character Check</div>
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
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
        <div className="p-5 text-zinc-500 bg-orange-50 mb-5 rounded-lg text-xs space-y-2">
          <p className="text-zinc-800 text-sm font-bold">⚠️ Warning:</p>
          <p>
            <span className="text-zinc-800">
              Operators have permissions to enter your dashboard, change your
              settings(excluding xLog subdomain) and post contents on your site.
            </span>
          </p>
        </div>
        <div>
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
                />
              )
            })}
            <style jsx global>{`
              .sortable-ghost {
                opacity: 0.4;
              }
            `}</style>
          </div>
          <div className="border-t pt-5 mt-10 space-x-3 flex items-center">
            <Button onClick={newEmptyItem}>Add</Button>
          </div>
        </div>
      </SettingsLayout>
    </DashboardLayout>
  )
}
