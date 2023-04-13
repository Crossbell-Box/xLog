const twColors = require("./tw-colors")
const alwaysColor = require("tailwindcss/colors")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
    colors: twColors,
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
        always: alwaysColor,
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
    },
  },
  variants: {},
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar-hide")],
}
