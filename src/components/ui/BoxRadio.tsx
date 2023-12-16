import { nanoid } from "nanoid"
import { useTranslations } from "next-intl"
import React, {
  ChangeEvent,
  Dispatch,
  FocusEvent,
  SetStateAction,
  useMemo,
  useState,
} from "react"

import { Input } from "~/components/ui/Input"
import { cn } from "~/lib/utils"

export type RadioItem = {
  text: string
  value?: string
  default?: boolean
}

export const BoxRadio = ({
  value,
  setValue,
  items,
}: {
  value: string
  setValue: Dispatch<SetStateAction<string>>
  items: RadioItem[]
}) => {
  const t = useTranslations()
  const randomId = useMemo(() => nanoid(), [])
  const [isCustom, setIsCustom] = useState(false)

  const toCustom = (
    e: ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>,
  ) => {
    setIsCustom(true)
    setValue(e.target.value)
  }

  const toDefined = (e: ChangeEvent<HTMLInputElement>) => {
    setIsCustom(false)
    setValue(e.target.value)
  }

  return (
    <div className="grid gap-4 grid-cols-3">
      {items.map((item) => {
        return (
          <div
            key={item.value || item.text}
            className="relative w-full min-h-[80px]"
          >
            {item.value ? (
              <>
                <input
                  className={cn(
                    "opacity-0 absolute inset-0 pointer-events-none",
                  )}
                  type="radio"
                  id={`${randomId}-${item.value}`}
                  name={randomId}
                  value={item.value}
                  checked={value === item.value}
                  onChange={toDefined}
                />
                <label
                  className={cn(
                    "absolute inset-0 flex items-center justify-center rounded-lg cursor-pointer border",
                    value === item.value
                      ? "border-accent border-2 text-accent"
                      : "",
                  )}
                  htmlFor={`${randomId}-${item.value}`}
                >
                  {t(item.text)}
                </label>
              </>
            ) : (
              <>
                <Input
                  className={cn("w-full min-h-[80px] text-center", {
                    "border-accent border-2 text-accent": isCustom,
                  })}
                  type="text"
                  id={`${randomId}-${item.value}`}
                  name={randomId}
                  placeholder={t(item.text) || ""}
                  onChange={toCustom}
                  onFocus={toCustom}
                />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
