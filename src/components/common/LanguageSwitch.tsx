"use client"

import { changeLanguage, useAvailableLanguages } from "~/lib/i18n/client"

import { Menu } from "../ui/Menu"

export function LanguageSwitch() {
  const languages = useAvailableLanguages()

  return (
    <Menu
      placement="top"
      target={
        <button className="inline-block icon-[mingcute--translate-2-line] text-2xl"></button>
      }
      dropdown={
        <>
          {languages.map((language, i) => (
            <Menu.Item
              key={i}
              type="button"
              onClick={() => {
                changeLanguage(language.code)
              }}
              className="mx-auto text-center"
            >
              <span>{language.name}</span>
              {language.active && (
                <span className="ml-2 icon-[mingcute--check-line] mr-2"></span>
              )}
            </Menu.Item>
          ))}
        </>
      }
    />
  )
}
