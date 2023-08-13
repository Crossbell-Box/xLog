"use client"

import { getAvailableLanguages } from "~/lib/i18n/client"

import { Menu } from "../ui/Menu"

export default function LanguageSwitch() {
  const languages = getAvailableLanguages()

  const changeLanguage = (language: string) => {
    document.cookie = `preferred_language=${language};${document.cookie}`
    window.location.reload()
  }

  return (
    <Menu
      placement="top"
      target={
        <button className="inline-block icon-[mingcute--translate-2-fill] text-2xl"></button>
      }
      dropdown={
        <>
          {languages.map((language, i) => (
            <Menu.Item
              key={i}
              type="button"
              onClick={() => {
                changeLanguage(language)
              }}
            >
              {language}
            </Menu.Item>
          ))}
        </>
      }
    />
  )
}
