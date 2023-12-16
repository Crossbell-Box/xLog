"use client"

import { useLocale } from "next-intl"

import { locales } from "~/i18n"

import { Menu } from "../ui/Menu"

export function LanguageSwitch() {
  const locale = useLocale()

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
