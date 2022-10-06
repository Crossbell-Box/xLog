module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
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
        "accent-emphasis": "var(--theme-color-emphasis)",
      },
      spacing: {
        sidebar: `240px`,
      },
      fontFamily: {
        mono: `Roboto Mono,Monaco,monospace`,
      },
    },
  },
  variants: {},
  plugins: [],
}
