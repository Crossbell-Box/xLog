"use client"

import { useTranslations } from "next-intl"
import React, { PropsWithChildren, useMemo } from "react"

import { cn } from "~/lib/utils"

interface Props {
  className?: string
  width?: number | string
  height?: number | string
}

const skeletonColor = "bg-gray-200 dark:bg-gray-700"

function unit(unit: string | number | undefined) {
  if (!unit) return
  return typeof unit === "number" ? `${unit}px` : unit
}

export function Skeleton({ className, width, height }: Props) {
  const sizeObj = useMemo(() => {
    const _size: any = {}
    let _className = []
    width ? (_size.width = unit(width)) : _className.push("w-full")
    height ? (_size.height = unit(height)) : _className.push("h-4")
    return {
      style: _size,
      className: _className.join(" "),
    }
  }, [width, height])

  return (
    <div
      className={cn(skeletonColor, sizeObj.className, className)}
      style={sizeObj.style}
    />
  )
}

function Container({
  count = 1,
  className,
  children,
}: PropsWithChildren<{ count?: number; className?: string }>) {
  const t = useTranslations()
  const childrenArray = React.Children.toArray(children)

  return (
    <div role="status" className={cn("animate-pulse", className)}>
      {Array.from(new Array(count)).map((_, index) => (
        <React.Fragment key={index}>
          {childrenArray.map((child, i) =>
            React.cloneElement(child as React.ReactElement<any>, {
              key: `child-${index}-${i}`,
            }),
          )}
        </React.Fragment>
      ))}
      <span className="sr-only">{t("Loading")}...</span>
    </div>
  )
}

function Circle({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <Skeleton
      className={cn("rounded-full", className)}
      width={size}
      height={size}
    />
  )
}

function Rectangle({ className }: { className?: string }) {
  return <Skeleton className={cn("rounded", className)} />
}

Skeleton.Container = Container
Skeleton.Circle = Circle
Skeleton.Rectangle = Rectangle
