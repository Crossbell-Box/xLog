import { useTranslations } from "next-intl"
import React, { useCallback, useState } from "react"
import { Virtuoso } from "react-virtuoso"

import { Modal } from "~/components/ui/Modal"
import { ExpandedCharacter } from "~/lib/types"

import { Button } from "../ui/Button"
import CharacterListItem from "./CharacterListItem"
import { Loading } from "./Loading"
import { PortalProvider } from "./Portal"

export const CharacterList = ({
  open,
  setOpen,
  hasMore,
  loadMore,
  list,
  title,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  hasMore: boolean
  loadMore: () => any
  list?: ({
    list: any[]
  } | null)[]
  title: string
}) => {
  const t = useTranslations()
  const flattenList = list?.reduce(
    (acc, cur) => acc.concat(cur?.list || []),
    [] as any[],
  ) as any[]

  const [modal, setModal] = useState<HTMLDivElement>()

  const modalEl = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      setModal(node)
    }
  }, [])

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title={title}
      zIndex={20}
      ref={modalEl}
    >
      {list?.length ? (
        <PortalProvider to={modal}>
          <Virtuoso
            overscan={10}
            style={{ height: flattenList.length * 64 }}
            fixedItemHeight={64}
            className="max-h-screen"
            endReached={() => hasMore && loadMore()}
            components={{
              Footer: hasMore ? Loading : undefined,
            }}
            data={flattenList}
            itemContent={(index, sub) => {
              const character: ExpandedCharacter =
                sub?.character || sub?.fromCharacter || sub?.toCharacter
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
            {t("No Content Yet")}
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
