"use client"

import type { Result as TocResult } from "mdast-util-toc"
import { createElement, useEffect, useRef, useState } from "react"

import { scrollTo } from "~/lib/utils"

interface ItemsProps {
  items: TocResult["map"]
  activeId?: string | null
  prefix?: string
}

function getIds(items: TocResult["map"]) {
  return (
    items?.children?.reduce((acc: string[], item) => {
      item.children.forEach((child) => {
        if (child.type === "paragraph" && (child.children[0] as any).url) {
          acc.push((child.children[0] as any).url.slice(1))
        } else if (child.type === "list") {
          acc.push(...getIds(child))
        }
      })
      return acc
    }, []) || []
  )
}

function getElement(id: string) {
  return document.querySelector(`#user-content-${id}`)
}

function useActiveId(itemIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>()
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id.replace("user-content-", ""))
          }
        })
      },
      { rootMargin: `0% 0% -80% 0%` },
    )
    itemIds.forEach((id) => {
      const element = getElement(id)
      if (element) {
        observer.observe(element)
      }
    })
    return () => {
      itemIds.forEach((id) => {
        const element = getElement(id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [itemIds])
  return activeId
}

function Items(props: ItemsProps) {
  const { items, activeId, prefix = "" } = props
  const [maxWidth, setMaxWidth] = useState(0)
  const anchorRef = useRef<HTMLLIElement>(null)
  useEffect(() => {
    const handler = () => {
      if (!anchorRef.current) return
      const $anchor = anchorRef.current
      const pos = $anchor.getBoundingClientRect()
      const maxWidth = window.innerWidth - pos.x - 20
      setMaxWidth(maxWidth)
    }

    handler()
    window.addEventListener("resize", handler)
    return () => {
      window.removeEventListener("resize", handler)
    }
  }, [])
  return (
    <ol className={prefix ? "pl-5" : ""}>
      <li ref={anchorRef} />
      {maxWidth > 0 &&
        items?.children?.map((item, index) => (
          <li
            key={index}
            style={{
              maxWidth: maxWidth + "px",
            }}
          >
            {item.children.map((child: any, i) => {
              const content = `${prefix}${index + 1}. ${child.content}`

              return (
                <span key={index + "-" + i}>
                  {child.type === "paragraph" && child.children?.[0]?.url && (
                    <span
                      data-url={child.children[0].url}
                      onClick={() => scrollTo(child.children[0].url)}
                      title={content}
                      className={
                        (`#${activeId}` === child.children[0].url
                          ? "text-accent font-bold"
                          : "text-zinc-400 font-medium") +
                        " truncate inline-block max-w-full align-bottom hover:text-accent cursor-pointer"
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: content,
                        }}
                      />
                    </span>
                  )}
                  {child.type === "list" &&
                    createElement(Items, {
                      items: child,
                      activeId,
                      prefix: `${prefix}${index + 1}.`,
                    })}
                </span>
              )
            })}
          </li>
        ))}
    </ol>
  )
}

function PostTocItems(props: ItemsProps) {
  const { items } = props

  const idList = getIds(items)
  const activeId = useActiveId(idList)

  return <Items items={items} activeId={activeId} />
}

export default PostTocItems
