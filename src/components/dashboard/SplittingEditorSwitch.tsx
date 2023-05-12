import { Switch } from "@headlessui/react"

import { cn } from "~/lib/utils"

interface SplittingEditorSwitchProps {
  state: boolean
  onChange(state: boolean): void
}

/**
 * Do some thing like button in `OptionsButton` which control by `isRendering`
 * but on md breakpoint
 */
export const SplittingEditorSwitch: React.FC<SplittingEditorSwitchProps> = (
  props,
) => {
  return (
    <Switch
      checked={props.state}
      onChange={props.onChange}
      className={cn(
        props.state ? "bg-accent" : "bg-gray-200",
        `relative inline-flex h-6 w-11 items-center rounded-full text-base dark:text-always-gray-200 text-always-gray-700 align-middle`,
      )}
    ></Switch>
  )
}
