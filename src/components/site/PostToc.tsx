"use client"

import { toHtml } from "hast-util-to-html"
import DOMPurify from "isomorphic-dompurify"
import katex from "katex"
import type { List } from "mdast"
import { toHast } from "mdast-util-to-hast"
import type { Result as TocResult } from "mdast-util-toc"
import React, { createElement, useEffect, useRef, useState } from "react"

import { scrollTo } from "~/lib/utils"

const inlineElements = ["delete", "strong", "emphasis", "inlineCode"]

function getLinkNode(node: any): List["children"] {
  if (node.type === "link") return node.children
  else return getLinkNode(node.children[0])
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

interface ItemsProps {
  items: TocResult["map"]
  activeId?: string | null
  prefix?: string
}

function Items(props: ItemsProps) {
  const { items, activeId, prefix = "" } = props
  return (
    <ol className={prefix ? "pl-5" : ""}>
      {items?.children?.map((item, index) => (
        <li key={index}>
          {item.children.map((child: any, i) => {
            const children = getLinkNode(child) || []
            let content = ""

            children.forEach((child: any) => {
              if (child.type === "inlineMath") {
                content += katex.renderToString(child.value, { output: "html" })
              } else if (inlineElements.includes(child.type)) {
                content += toHtml(toHast(child) || [])
              } else {
                content += child.value
              }
            })
            content = `${prefix}${index + 1}. ${DOMPurify.sanitize(content)}`

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

export const PostToc = ({ data }: { data: TocResult }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const idList = getIds(data?.map)
  const activeId = useActiveId(idList)

  return (
    <div
      className="xlog-post-toc absolute left-full pl-14 h-full top-0 lg:block hidden"
      ref={containerRef}
    >
      <div
        className="sticky top-14 text-sm leading-loose whitespace-nowrap text-ellipsis max-h-[calc(100vh-theme('spacing.28'))] truncate"
        style={{
          overflowY: "auto",
        }}
      >
        <Items items={data?.map} activeId={activeId} />
      </div>
    </div>
  )
}
