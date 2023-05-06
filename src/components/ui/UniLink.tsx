"use client"

import Link from "next/link"

export type UniLinkProps = {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  target?: string
}

export const UniLink: React.FC<UniLinkProps> = ({
  href,
  onClick,
  children,
  className,
  target,
  ...props
}) => {
  if (onClick) {
    return (
      <button className={className} onClick={onClick} {...props}>
        {children}
      </button>
    )
  }

  if (!href) {
    return <span className={className}>{children}</span>
  }

  const isExternal =
    href && (/^https?:\/\//.test(href) || href.startsWith("/feed"))

  if (isExternal) {
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
