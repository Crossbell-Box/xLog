import React, { FC, PropsWithChildren, useEffect } from "react"
import { create } from "zustand"

import { cn } from "~/lib/utils"

export const FABBase: FC<
  PropsWithChildren<
    {} & React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >
  >
> = (props) => {
  const { children, ...extra } = props
  const { className, ...rest } = extra

  return (
    <button
      className={cn(
        "inline-flex w-8 h-8 mt-2 items-center justify-center rounded-md",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export interface FABContainerContext {
  isOverFirstScreen: boolean
}

const useFabContextState = create<FABContainerContext>(() => ({
  isOverFirstScreen: false,
}))
export const FABContainer: FC<{
  children: (ctx: FABContainerContext) => JSX.Element
}> = (props) => {
  const isOverflowFirstScreen = useFabContextState(
    (state) => state.isOverFirstScreen,
  )
  useEffect(() => {}, [])
  return (
    <div
      className={cn(
        "z-[9] right-4 bottom-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] fixed font-lg",
      )}
    >
      {React.Children.map(props.children, (caller) => {
        return caller({ isOverFirstScreen: isOverflowFirstScreen })
      })}
    </div>
  )
}
