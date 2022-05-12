import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { FormEvent, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { trpc } from "~/lib/trpc"
import { useForm } from "react-hook-form"
import { SiteNavigationItem } from "~/lib/types"
import { nanoid } from "nanoid"

export default function SiteSettingsNavigationPage() {
  const router = useRouter()

  const [itemsModified, setItemsModified] = useState(false)
  const subdomain = router.query.subdomain as string

  const siteResult = trpc.useQuery(["site", { site: subdomain }], {
    enabled: !!subdomain,
  })
  const updateSite = trpc.useMutation("site.updateSite")

  const [items, setItems] = useState<SiteNavigationItem[]>([])

  const updateItem = (id: string, newItem: Partial<SiteNavigationItem>) => {
    setItems((items) => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, ...newItem }
        }
        return item
      })
    })
    setItemsModified(true)
  }

  const newEmptyItem = () => {
    setItems((items) => [...items, { id: nanoid(), label: "", url: "" }])
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateSite.mutate({
      site: siteResult.data!.id,
      navigation: items,
    })
  }

  const removeItem = (id: string) => {
    setItems((items) => items.filter((item) => item.id !== id))
    setItemsModified(true)
  }

  useEffect(() => {
    if (!siteResult.isPreviousData && siteResult.data?.navigation) {
      setItems(siteResult.data.navigation)
    }
  }, [siteResult.isPreviousData, siteResult.data])

  useEffect(() => {
    if (updateSite.isSuccess) {
      updateSite.reset()
      toast.success("Saved")
      setItemsModified(true)
    }
  }, [updateSite])

  return (
    <DashboardLayout>
      <SettingsLayout title="Site Settings" type="site">
        <form onSubmit={handleSubmit}>
          <div className="bg-zinc-50 rounded-lg p-5">
            {items.length === 0 && (
              <div className="text-center text-zinc-500">
                No navigation items yet
              </div>
            )}
            {items.map((item) => {
              return (
                <div
                  key={item.id}
                  className="flex space-x-5 border-b last:border-0 mb-5 pb-5 last:pb-0 last:mb-0"
                >
                  <Input
                    label="Label"
                    required
                    id={`${item.id}-label`}
                    value={item.label}
                    onChange={(e) =>
                      updateItem(item.id, { label: e.target.value })
                    }
                  />
                  <Input
                    label="URL"
                    required
                    id={`${item.id}-url`}
                    type="text"
                    value={item.url}
                    pattern="(https?://|/).+"
                    title="URL must start with / or http:// or https://"
                    onChange={(e) =>
                      updateItem(item.id, { url: e.target.value })
                    }
                  />
                  <div className="flex items-end relative -top-[5px]">
                    <Button
                      onClick={() => removeItem(item.id)}
                      variantColor="red"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="border-t pt-5 mt-10 space-x-3 flex items-center">
            <Button
              type="submit"
              isLoading={updateSite.isLoading}
              isDisabled={!itemsModified}
            >
              Save
            </Button>
            <Button variant="secondary" onClick={newEmptyItem}>
              New Item
            </Button>
          </div>
        </form>
      </SettingsLayout>
    </DashboardLayout>
  )
}
