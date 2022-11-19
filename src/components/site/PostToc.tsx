import React, { useEffect, useState, useRef } from "react"
import type { Result as TocResult } from "mdast-util-toc"
import { Link } from "react-scroll"

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

function useActiveId(itemIds: string[]) {
  const [activeId, setActiveId] = useState(`test`)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: `0% 0% -80% 0%` },
    )
    itemIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })
    return () => {
      itemIds.forEach((id) => {
        const element = document.getElementById(id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [itemIds])
  return activeId
}

function renderItems(items: TocResult["map"], activeId: string, prefix = "") {
  return (
    <ol className={prefix ? "pl-5" : ""}>
      {items?.children?.map((item, index) => (
        <li key={index}>
          {item.children.map((child: any, i) => (
            <span key={index + "-" + i}>
              {child.type === "paragraph" && child.children?.[0]?.url && (
                <Link
                  to={decodeURI(child.children[0].url.slice(1))}
                  spy={true}
                  smooth={true}
                  duration={500}
                  offset={-20}
                  href={child.children[0].url}
                  className={
                    (activeId === child.children[0].url.slice(1)
                      ? "text-accent"
                      : "text-zinc-700") +
                    " truncate inline-block max-w-full align-bottom hover:text-accent"
                  }
                >
                  {`${prefix}${index + 1}. ${
                    child.children[0].children?.[0]?.value ||
                    child.children[0].children?.[0]?.children?.[0]?.value
                  }`}
                </Link>
              )}
              {child.type === "list" &&
                renderItems(child, activeId, `${index + 1}.`)}
            </span>
          ))}
        </li>
      ))}
    </ol>
  )
}

export const PostToc: React.FC<{
  data: TocResult
}> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [maxWidth, setMaxWidth] = useState(0)
  useEffect(() => {
    if (containerRef?.current) {
      setMaxWidth(
        (window.innerWidth -
          (containerRef.current?.parentElement?.clientWidth || 0)) /
          2 -
          40,
      )
    }
  }, [containerRef])

  const idList = getIds(data?.map)
  const activeId = useActiveId(idList)

  return (
    <div
      className="xlog-post-toc absolute left-full pl-10 h-full top-0"
      style={{
        maxWidth: maxWidth > 40 ? maxWidth : 0,
        display: maxWidth > 40 ? "block" : "none",
      }}
      ref={containerRef}
    >
      <div className="sticky top-14 text-sm leading-loose whitespace-nowrap truncate text-ellipsis">
        {renderItems(data?.map, activeId)}
      </div>
    </div>
  )
}
