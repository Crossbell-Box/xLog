"use client"

import equal from "fast-deep-equal"
import { nanoid } from "nanoid"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { ReactSortable } from "react-sortablejs"

import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Platform, PlatformsSyncMap } from "~/components/site/Platform"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { UniLink } from "~/components/ui/UniLink"
import { useGetSite, useUpdateSite } from "~/queries/site"

type Item = {
  identity: string
  platform: string
  url?: string | undefined
} & {
  id: string
}

type UpdateItem = (id: string, newItem: Partial<Item>) => void

type RemoveItem = (id: string) => void

const SortableNavigationItem = ({
  item,
  updateItem,
  removeItem,
}: {
  item: Item
  updateItem: UpdateItem
  removeItem: RemoveItem
}) => {
  const t = useTranslations()
  return (
    <div className="flex space-x-5 border-b p-5 bg-zinc-50 last:border-0">
      <div>
        <button
          type="button"
          className="drag-handle cursor-grab -mt-1 text-zinc-400 rounded-lg h-8 w-6 flex items-center justify-center hover:text-zinc-800 hover:bg-zinc-200"
        >
          <i className="i-mingcute-dot-grid-fill" />
        </button>
      </div>
      <div className="flex flex-wrap gap-5">
        <Input
          label={t("Platform") || ""}
          required
          id={`${item.id}-platform`}
          value={item.platform}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateItem(item.id, { platform: e.target.value })
          }
          options={Object.keys(PlatformsSyncMap)}
        />
        <Input
          label={t("ID")}
          required
          id={`${item.id}-identity`}
          type="text"
          value={item.identity}
          placeholder={PlatformsSyncMap[item.platform]?.identityFormatTemplate}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateItem(item.id, { identity: e.target.value })
          }
        />
        <div className="flex items-end pb-2">
          <Platform
            platform={item.platform}
            username={item.identity}
          ></Platform>
        </div>
        <div className="flex items-end relative top-[-5px]">
          <Button onClick={() => removeItem(item.id)} variantColor="red">
            {t("Remove")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SiteSettingsNavigationPage() {
  const params = useParams()
  const subdomain = params?.subdomain as string

  const updateSite = useUpdateSite()
  const site = useGetSite(subdomain)
  const t = useTranslations()

  const [items, setItems] = useState<Item[]>([])

  const itemsModified = useMemo(() => {
    if (!site.isSuccess) return false
    return !equal(items, site.data?.metadata?.content?.connected_accounts)
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
    if (site.data?.handle) {
      updateSite.mutate({
        characterId: site.data?.characterId,
        connected_accounts: items.map(({ id, ...item }) => item),
      })
    }
  }

  useEffect(() => {
    if (updateSite.isSuccess) {
      toast.success("Saved")
    } else if (updateSite.isError) {
      toast.error("Failed to save")
    }
  }, [updateSite.isSuccess, updateSite.isError])

  const removeItem: RemoveItem = (id) => {
    setItems((items) => items.filter((item) => item.id !== id))
  }

  const [hasSet, setHasSet] = useState(false)
  useEffect(() => {
    if (site.data?.metadata?.content?.connected_accounts && !hasSet) {
      setHasSet(true)
      setItems(
        site.data?.metadata?.content?.connected_accounts.map((item) => {
          const match = item.match(/:\/\/account:(.*)@(.*)/)
          if (match) {
            return {
              id: nanoid(),
              identity: match[1],
              platform: match[2],
            }
          } else {
            return {
              id: nanoid(),
              identity: item,
              platform: "",
            }
          }
        }),
      )
    }
  }, [site.data?.metadata?.content?.connected_accounts, hasSet])

  return (
    <SettingsLayout title="Site Settings">
      <div className="p-5 text-zinc-500 bg-zinc-50 mb-5 rounded-lg text-xs space-y-2">
        <p className="text-zinc-800 text-sm font-bold">{t("Tips")}:</p>
        <p>
          <span className="text-zinc-800">{t("social tips.p1")}</span>
        </p>
        <p>
          <span className="text-zinc-800">
            {t.rich("social tips.p2", {
              link: (chunks) => (
                <UniLink
                  href="https://github.com/Crossbell-Box/xLog/blob/dev/src/components/site/Platform.tsx#L11"
                  className="underline"
                >
                  (chunks)
                </UniLink>
              ),
            })}
          </span>
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="bg-zinc-50 rounded-lg">
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
            {/* eslint-disable-next-line react/no-unknown-property */}
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
            {t("Save")}
          </Button>
          <Button variant="secondary" onClick={newEmptyItem}>
            {t("New Item")}
          </Button>
        </div>
      </form>
    </SettingsLayout>
  )
}
