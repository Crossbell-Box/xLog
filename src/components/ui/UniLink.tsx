import Link from "next/link"

export type UniLinkProps = {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  target?: string
}

export const UniLink = ({
  href,
  onClick,
  children,
  className,
  target,
  ...props
}: UniLinkProps) => {
  if (onClick) {
    return (
      <button className={className} onClick={onClick} {...props}>
        {children}
      </button>
    )
  }

  if (!href) {
    return (
      <span className={className} {...props}>
        {children}
      </span>
    )
  }

  const isExternal =
    (href && (/^https?:\/\//.test(href) || href.startsWith("/feed"))) ||
    href.startsWith("mailto:")

  const isInModal =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/post/")

  if (isExternal || isInModal) {
    return (
      <a
        {...props}
        className={className}
        href={href}
        target="_blank"
        rel="nofollow noreferrer"
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} target={target}>
      {children}
    </Link>
  )
}
