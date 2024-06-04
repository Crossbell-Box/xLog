"use client"

import { useLocale } from "next-intl"

import { locales, nameMap } from "~/i18n"

import { Menu } from "../ui/Menu"

export function LanguageSwitch() {
  const locale = useLocale()

  return (
    <Menu
      placement="top"
      target={
        <button className="inline-block i-mingcute-translate-2-line text-2xl"></button>
      }
      dropdown={
        <>
          {locales.map((lo, i) => (
            <Menu.Item
              key={i}
              type="button"
              onClick={() => {
                document.cookie = `NEXT_LOCALE=${lo};`
                window.location.reload()
              }}
              className="mx-auto"
            >
              <span>{nameMap[lo]}</span>
              {locale === lo && (
                <span className="ml-2 i-mingcute-check-line"></span>
              )}
            </Menu.Item>
          ))}
        </>
      }
    />
  )
}
