import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { SiteNavigationItem, Profile } from "~/lib/types"
import { nanoid } from "nanoid"
import { ReactSortable } from "react-sortablejs"
import equal from "fast-deep-equal"
import { getSite, updateSite } from "~/models/site.model"

type UpdateItem = (id: string, newItem: Partial<SiteNavigationItem>) => void

type RemoveItem = (id: string) => void

const SortableNavigationItem: React.FC<{
  item: SiteNavigationItem
  updateItem: UpdateItem
  removeItem: RemoveItem
}> = ({ item, updateItem, removeItem }) => {
  return (
    <div className="flex space-x-5 border-b p-5 bg-zinc-50 last:border-0">
      <div>
        <button
          type="button"
          className="drag-handle cursor-grab -mt-1 text-zinc-400 rounded-lg h-8 w-6 flex items-center justify-center hover:text-zinc-800 hover:bg-zinc-200"
        >
          <svg className="w-5 h-8" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M9 20q-.825 0-1.412-.587Q7 18.825 7 18q0-.825.588-1.413Q8.175 16 9 16t1.413.587Q11 17.175 11 18q0 .825-.587 1.413Q9.825 20 9 20Zm0-6q-.825 0-1.412-.588Q7 12.825 7 12t.588-1.413Q8.175 10 9 10t1.413.587Q11 11.175 11 12q0 .825-.587 1.412Q9.825 14 9 14Zm0-6q-.825 0-1.412-.588Q7 6.825 7 6t.588-1.412Q8.175 4 9 4t1.413.588Q11 5.175 11 6t-.587 1.412Q9.825 8 9 8Zm6 0q-.825 0-1.412-.588Q13 6.825 13 6t.588-1.412Q14.175 4 15 4t1.413.588Q17 5.175 17 6t-.587 1.412Q15.825 8 15 8Zm0 6q-.825 0-1.412-.588Q13 12.825 13 12t.588-1.413Q14.175 10 15 10t1.413.587Q17 11.175 17 12q0 .825-.587 1.412Q15.825 14 15 14Zm0 6q-.825 0-1.412-.587Q13 18.825 13 18q0-.825.588-1.413Q14.175 16 15 16t1.413.587Q17 17.175 17 18q0 .825-.587 1.413Q15.825 20 15 20Z"
            ></path>
          </svg>
        </button>
      </div>
      <Input
        label="Label"
        required
        id={`${item.id}-label`}
        value={item.label}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateItem(item.id, { url: e.target.value })
        }
      />
      <div className="flex items-end relative -top-[5px]">
        <Button onClick={() => removeItem(item.id)} variantColor="red">
          Remove
        </Button>
      </div>
    </div>
  )
}

export default function SiteSettingsNavigationPage() {
  const router = useRouter()

  const subdomain = router.query.subdomain as string

  let [site, setSite] = useState<Profile | null>(null)

  useEffect(() => {
    if (subdomain) {
      getSite(subdomain).then((site) => {
        setSite(site)
      })
    }
  }, [subdomain])

  const [items, setItems] = useState<SiteNavigationItem[]>([])

  const itemsModified = useMemo(() => {
    if (!site) return false
    return !equal(items, site.navigation)
  }, [items, site])

  const updateItem: UpdateItem = (id, newItem) => {
    setItems((items) => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, ...newItem }
        }
        return item
      })
    })
  }

  const newEmptyItem = () => {
    setItems((items) => [...items, { id: nanoid(), label: "", url: "" }])
  }

  let [loading, setLoading] = useState<boolean>(false)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    updateSite({
      site: site!.username!,
      navigation: items,
    }).then((result) => {
      if (result.code === 0) {
        toast.success("Saved")
      } else {
        toast.error("Failed to save" + ": " + result.message)
      }
      setLoading(false)
    })
  }

  const removeItem: RemoveItem = (id) => {
    setItems((items) => items.filter((item) => item.id !== id))
  }

  useEffect(() => {
    if (site?.navigation) {
      setItems(site.navigation)
    }
  }, [site?.navigation])

  return (
    <DashboardLayout title="Navigation">
      <SettingsLayout title="Site Settings" type="site">
        <form onSubmit={handleSubmit}>
          <div className="bg-zinc-50 rounded-lg overflow-hidden">
            {items.length === 0 && (
              <div className="text-center text-zinc-500 p-5">
                No navigation items yet
              </div>
            )}
            <ReactSortable
              list={items}
              setList={setItems}
              handle=".drag-handle"
            >
              {items.map((item) => {
                return (
                  <SortableNavigationItem
                    key={item.id}
                    item={item}
                    updateItem={updateItem}
                    removeItem={removeItem}
                  />
                )
              })}
              <style jsx global>{`
                .sortable-ghost {
                  opacity: 0.4;
                }
              `}</style>
            </ReactSortable>
          </div>
          <div className="border-t pt-5 mt-10 space-x-3 flex items-center">
            <Button
              type="submit"
              isLoading={loading}
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
