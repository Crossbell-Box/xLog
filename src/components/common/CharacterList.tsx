import { useTranslation } from "next-i18next"
import React from "react"
import InfiniteScroll from "react-infinite-scroller"

import { Modal } from "~/components/ui/Modal"

import { Button } from "../ui/Button"
import CharacterListItem from "./CharacterListItem"

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

  return (
    <Modal open={open} setOpen={setOpen} title={title} ZIndex={20}>
      <div className="px-5 overflow-auto flex-1">
        <InfiniteScroll
          loadMore={loadMore}
          hasMore={hasMore}
          loader={
            <div className="text-sm py-3 text-center" key={0}>
              {t("Loading")} ...
            </div>
          }
          useWindow={false}
        >
          {list?.length ? (
            list.map((page) =>
              page?.list?.map((sub: any, index) => {
                const character = sub?.character || sub?.fromCharacter
                return (
                  <CharacterListItem
                    key={index}
                    sub={sub}
                    character={character}
                  />
                )
              }),
            )
          ) : (
            <div className="py-3 text-center text-zinc-300">
              {t("No Content Yet.")}
            </div>
          )}
        </InfiniteScroll>
      </div>
      <div className="h-16 border-t flex items-center px-5 py-4">
        <Button isBlock onClick={() => setOpen(false)}>
          {t("Close")}
        </Button>
      </div>
    </Modal>
  )
}
