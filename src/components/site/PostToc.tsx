import React, { useEffect, useState, useRef } from "react"
import type { Result as TocResult } from "mdast-util-toc"
import { Link } from "react-scroll"

function renderItems(items: TocResult["map"], activeId: string, prefix = "") {
  return (
    <ol className={prefix ? "pl-5" : ""}>
      {items?.children?.map((item, index) => (
        <li key={index}>
          {item.children.map((child: any) => (
            <>
              {child.type === "paragraph" && child.children?.[0]?.url && (
                <Link
                  to={decodeURI(child.children[0].url.slice(1))}
                  spy={true}
                  smooth={true}
                  duration={500}
                  offset={-20}
                  href={child.children[0].url}
                >
                  {`${prefix}${index + 1}. ${
                    child.children[0].children?.[0]?.value
                  }`}
                </Link>
              )}
              {child.type === "list" &&
                renderItems(child, activeId, `${index + 1}.`)}
            </>
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

  return (
    <div
      className="xlog-post-toc absolute left-full pl-10 h-full top-[124px]"
      style={{
        maxWidth: maxWidth > 40 ? maxWidth : 0,
      }}
      ref={containerRef}
    >
      <div className="sticky top-14 text-sm leading-loose whitespace-nowrap truncate text-ellipsis">
        {renderItems(data?.map, "activeId")}
      </div>
    </div>
  )
}
