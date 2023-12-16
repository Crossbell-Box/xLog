import { Config } from "tailwindcss"
import {
  createVariableColors,
  getDefaultColors,
  variableColorsPlugin,
} from "tailwindcss-variable-colors"

import { iconsPlugin } from "@egoist/tailwindcss-icons"

const config: Config = {
  content: ["./src/**/*.tsx"],
  safelist: ["i-mingcute-link-line", "i-mingcute-copy-2-line"],
  darkMode: ["class", "html.dark"],
  theme: {
    colors: createVariableColors(),
    extend: {
      boxShadow: {
        modal: `rgb(0 0 0 / 20%) 0px 0px 1px, rgb(0 0 0 / 20%) 0px 20px 40px`,
        "card-hover": `rgb(0 0 0 / 5%) 0px 0px 1px, rgb(0 0 0 / 12%) 0px 15px 30px`,
        card: `rgb(0 0 0 / 5%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 15px 30px`,
        button: `0 1.5px 1px var(--shadow-color-button)`,
      },
      colors: {
        border: "var(--border-color)",
        accent: "var(--theme-color)",
        hover: "var(--hover-color)",
        always: getDefaultColors() as any,
      },
      spacing: {
        sidebar: `240px`,
      },
      fontFamily: {
        mono: `Roboto Mono,Monaco,monospace`,
      },
      keyframes: {
        "buzz-out": {
          "10%": {
            transform: "translateX(3px) rotate(2deg)",
          },
          "20%": {
            transform: "translateX(-3px) rotate(-2deg)",
          },
          "30%": {
            transform: "translateX(3px) rotate(2deg)",
          },
          "40%": {
            transform: "translateX(-3px) rotate(-2deg)",
          },
          "50%": {
            transform: "translateX(2px) rotate(1deg)",
          },
          "60%": {
            transform: "translateX(-2px) rotate(-1deg)",
          },
          "70%": {
            transform: "translateX(2px) rotate(1deg)",
          },
          "80%": {
            transform: "translateX(-2px) rotate(-1deg)",
          },
          "90%": {
            transform: "translateX(1px) rotate(0)",
          },
          "100%": {
            transform: "translateX(-1px) rotate(0)",
          },
        },
      },
      animation: {
        "buzz-out": "buzz-out .75s linear 1",
      },
      transitionDuration: {
        "400": "400ms",
        "800": "800ms",
      },
    },
  },
  variants: {},
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar-hide"),
    iconsPlugin(),
    variableColorsPlugin(),
  ],
}

export default config
