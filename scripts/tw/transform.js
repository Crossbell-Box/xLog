const colors = require("tailwindcss/colors")

const colorKeys = Object.keys(colors)
const colorObject = {}

const hexToRGB = (hex) => {
  hex = hex.replace("#", "")

  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  return `${r}, ${g}, ${b}`
}

const deprecatedColorKeyMap = {
  lightBlue: "sky",
  warmGray: "stone",
  trueGray: "neutral",
  coolGray: "gray",
  blueGray: "slate",
}
for (const key of colorKeys) {
  if (typeof colors[key] === "object") {
    if (deprecatedColorKeyMap[key]) {
      colorObject[deprecatedColorKeyMap[key]] = colors[key]
      continue
    }

    colorObject[key] = colors[key]
  }
}

const transformColorObjectOfDarkmode = () => {
  const cssVar = {}
  const cssVarDark = {}
  const nextColorObject = {}
  // slate: {
  //   50: '#f8fafc',
  // }
  // to
  // slate: {
  //   50: 'rgb(var(--tw-colors-i-slate-50) / <alpha-value>)',
  // ...
  // }
  for (const colorKey of Object.keys(colorObject)) {
    const color = colorObject[colorKey]

    if (typeof color === "object") {
      const nextColor = {}

      for (const colorNumberKey of Object.keys(color)) {
        const cssVarKey = `--tw-colors-i-${colorKey}-${colorNumberKey}`
        // @see https://tailwindcss.com/docs/customizing-colors#using-the-default-colors
        nextColor[colorNumberKey] = `rgba(var(${cssVarKey}), <alpha-value>)`

        cssVar[cssVarKey] = hexToRGB(color[colorNumberKey])
        // 50 -> 950, 100 -> 900, 200 -> 800, ...

        // colorKey:
        const reverseColorNumberKey = 1000 - parseInt(colorNumberKey)
        cssVarDark[cssVarKey] = hexToRGB(color[reverseColorNumberKey])
      }

      nextColorObject[colorKey] = nextColor
    }
  }

  // merge const color
  Object.assign(nextColorObject, {
    inherit: "inherit",
    current: "currentColor",
    transparent: "transparent",
    black: "var(--tw-colors-i-black)",
    white: "var(--tw-colors-i-white)",
  })
  cssVar["--tw-colors-i-black"] = "0, 0, 0"
  cssVar["--tw-colors-i-white"] = "255, 255, 255"
  cssVarDark["--tw-colors-i-black"] = "255, 255, 255"
  cssVarDark["--tw-colors-i-white"] = "0, 0, 0"

  return [nextColorObject, cssVar, cssVarDark]
}

function generateCSSByVar(cssVar) {
  let css = ""
  for (const key of Object.keys(cssVar)) {
    css += `  ${key}: ${cssVar[key]};\n`
  }

  return css
}

module.exports = {
  transformColorObjectOfDarkmode,
  generateCSSByVar,
}
