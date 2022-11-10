import { defineConfig } from "unocss"
import presetIcons from "@unocss/preset-icons"

export default defineConfig({
  presets: [
    presetIcons({
      warn: true,
    }) as any,
  ],
})
