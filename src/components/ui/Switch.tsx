import { Fragment } from "react"

import { Switch as HUISwitch } from "@headlessui/react"

interface SwitchProps {
  label: string
  checked: boolean
  setChecked: (state: boolean) => void
}
export const Switch = ({ label, checked, setChecked }: SwitchProps) => (
  <HUISwitch.Group>
    <div className="flex items-center">
      {/*Switch self*/}
      <HUISwitch checked={checked} onChange={setChecked} as={Fragment}>
        {({ checked }) => (
          <button
            className={`${
              checked ? "bg-[var(--theme-color)]" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span className="sr-only">{label}</span>
            <span
              className={`${
                checked ? "translate-x-6" : "translate-x-1"
              } inline-block size-4 rounded-full bg-white transition`}
            />
          </button>
        )}
      </HUISwitch>

      {/*Switch label*/}
      <HUISwitch.Label className={"ml-4"}>{label}</HUISwitch.Label>
    </div>
  </HUISwitch.Group>
)
