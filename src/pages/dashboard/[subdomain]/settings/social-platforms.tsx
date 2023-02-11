import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { useRouter } from "next/router"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { Profile } from "~/lib/types"
import { nanoid } from "nanoid"
import { ReactSortable } from "react-sortablejs"
import equal from "fast-deep-equal"
import { useGetSite, useUpdateSite } from "~/queries/site"
import type { ReactElement } from "react"
import { UniLink } from "~/components/ui/UniLink"
import { Platform } from "~/components/site/Platform"

type Item = Required<Profile>["connected_accounts"][number] & {
  id: string
}

type UpdateItem = (id: string, newItem: Partial<Item>) => void

type RemoveItem = (id: string) => void

const SortableNavigationItem: React.FC<{
  item: Item
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
        label="Platform"
        required
        id={`${item.id}-platform`}
        value={item.platform}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateItem(item.id, { platform: e.target.value })
        }
      />
      <Input
        label="Identity"
        required
        id={`${item.id}-identity`}
        type="text"
        value={item.identity}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateItem(item.id, { identity: e.target.value })
        }
      />
      <div className="flex items-end pb-2">
        <Platform platform={item.platform} username={item.identity}></Platform>
      </div>
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

  const updateSite = useUpdateSite()
  const site = useGetSite(subdomain)

  const [items, setItems] = useState<Item[]>([])

  const itemsModified = useMemo(() => {
    if (!site.isSuccess) return false
    return !equal(items, site.data?.connected_accounts)
  }, [items, site.data, site.isSuccess])

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
    setItems((items) => [
      ...items,
      { id: nanoid(), platform: "", identity: "" },
    ])
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateSite.mutate({
      site: site.data?.username!,
      connected_accounts: items.map(({ id, ...item }) => item),
    })
  }

  useEffect(() => {
    if (updateSite.isSuccess) {
      if (updateSite.data?.code === 0) {
        toast.success("Saved")
      } else {
        toast.error("Failed to save" + ": " + updateSite.data.message)
      }
    } else if (updateSite.isError) {
      toast.error("Failed to save")
    }
  }, [updateSite.isSuccess, updateSite.isError])

  const removeItem: RemoveItem = (id) => {
    setItems((items) => items.filter((item) => item.id !== id))
  }

  const [hasSet, setHasSet] = useState(false)
  useEffect(() => {
    if (site.data?.connected_accounts && !hasSet) {
      setHasSet(true)
      setItems(
        site.data?.connected_accounts.map((item) => ({
          id: nanoid(),
          ...item,
        })),
      )
    }
  }, [site.data?.connected_accounts, hasSet])

  return (
    <SettingsLayout title="Site Settings" type="site">
      <div className="p-5 text-zinc-500 bg-zinc-50 mb-5 rounded-lg text-xs space-y-2">
        <p className="text-zinc-800 text-sm font-bold">Tips:</p>
        <p>
          <span className="text-zinc-800">
            These social platforms will be displayed in the bottom right hand
            corner of your xLog.
          </span>
        </p>
        <p>
          <span className="text-zinc-800">
            You can also connect to Twitter, Telegram Channel, Medium, Substack
            and more and automatically sync content on{" "}
            <UniLink href="https://xsync.app/" className="underline">
              xSync
            </UniLink>
            . When you have set up the sync there, it will also show here.
          </span>
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="bg-zinc-50 rounded-lg overflow-hidden">
          {items.length === 0 && (
            <div className="text-center text-zinc-500 p-5">
              No navigation items yet
            </div>
          )}
          <ReactSortable list={items} setList={setItems} handle=".drag-handle">
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
  )
}

SiteSettingsNavigationPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Site Settings">{page}</DashboardLayout>
}
