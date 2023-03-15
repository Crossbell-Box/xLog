import { cn } from "~/lib/utils"
import React, {
  ChangeEvent,
  FocusEvent,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from "react"
import { UniLink } from "./UniLink"
import { useTranslation } from "next-i18next"
import { nanoid } from "nanoid"
import { Input } from "~/components/ui/Input"

export type RadioItem = {
  text: string
  value?: string
  default?: boolean
}

export const BoxRadio: React.FC<{
  value: string
  setValue: Dispatch<SetStateAction<string>>
  items: RadioItem[]
}> = ({ value, setValue, items }) => {
  const { t } = useTranslation(["common"])
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
                    "opacity-0 absolute left-0 right-0 top-0 bottom-0 pointer-events-none",
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
                    "absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center rounded-lg cursor-pointer border",
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
