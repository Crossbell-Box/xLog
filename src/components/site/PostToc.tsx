import { useRef, useEffect, useState } from "react"

export const PostToc: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
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
      className="xlog-post-toc absolute left-full pl-10 h-full top-0"
      style={{
        maxWidth: maxWidth > 40 ? maxWidth : 0,
      }}
      ref={containerRef}
    >
      <div className="sticky top-14 text-sm leading-loose whitespace-nowrap truncate text-ellipsis">
        {children}
      </div>
    </div>
  )
}
