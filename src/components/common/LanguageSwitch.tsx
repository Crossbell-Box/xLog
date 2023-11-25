"use client"

import { useParams } from "next/navigation"

import { locales } from "~/i18n"

import { Menu } from "../ui/Menu"

export function LanguageSwitch() {
  const params = useParams()

  const nameMap: Record<string, string> = {
    en: "English",
    zh: "简体中文",
    "zh-TW": "繁體中文",
    ja: "日本語",
  }

  return (
    <Menu
      placement="top"
      target={
        <button className="inline-block icon-[mingcute--translate-2-line] text-2xl"></button>
      }
      dropdown={
        <>
          {locales.map((locale, i) => (
            <Menu.Item
              key={i}
              type="button"
              onClick={() => {
                document.cookie = `NEXT_LOCALE=${locale};`
                window.location.reload()
              }}
              className="mx-auto"
            >
              <span>{nameMap[locale]}</span>
              {params.locale === locale && (
                <span className="ml-2 icon-[mingcute--check-line]"></span>
              )}
            </Menu.Item>
          ))}
        </>
      }
    />
  )
}
