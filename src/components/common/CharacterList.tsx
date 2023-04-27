import { useTranslation } from "next-i18next"
import React, { useRef } from "react"
import { Virtuoso } from "react-virtuoso"

import { Modal } from "~/components/ui/Modal"

import { Button } from "../ui/Button"
import CharacterListItem from "./CharacterListItem"
import { PortalProvider } from "./Portal"

export const CharacterList: React.FC<{
  open: boolean
  setOpen: (open: boolean) => void
  hasMore: boolean
  loadMore: () => any
  list?: ({
    list: any[]
  } | null)[]
  title: string
}> = ({ open, setOpen, hasMore, loadMore, list, title }) => {
  const { t } = useTranslation("common")
  const flattenList = list?.reduce(
    (acc, cur) => acc.concat(cur?.list || []),
    [] as any[],
  ) as any[]

  const $modalEl = useRef<HTMLDivElement>(null)

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title={title}
      zIndex={20}
      ref={$modalEl}
    >
      {list?.length ? (
        <PortalProvider to={$modalEl.current!}>
          <Virtuoso
            overscan={10}
            style={{ height: flattenList.length * 64 }}
            fixedItemHeight={64}
            className="max-h-screen"
            endReached={() => hasMore && loadMore()}
            components={{
              Footer: hasMore ? Loader : undefined,
            }}
            data={flattenList}
            itemContent={(index, sub) => {
              const character = sub?.character || sub?.fromCharacter
              return (
                <CharacterListItem
                  key={index}
                  sub={sub}
                  character={character}
                />
              )
            }}
          ></Virtuoso>
        </PortalProvider>
      ) : (
        <div className="px-5 overflow-auto flex-1">
          <div className="py-3 text-center text-zinc-300">
            {t("No Content Yet.")}
          </div>
        </div>
      )}

      <div className="h-16 border-t flex items-center px-5 py-4">
        <Button isBlock onClick={() => setOpen(false)}>
          {t("Close")}
        </Button>
      </div>
    </Modal>
  )
}

const Loader = () => {
  const { t } = useTranslation("common")
  return (
    <div className="text-sm py-3 text-center" key={0}>
      {t("Loading")} ...
    </div>
  )
}
