module.exports = {
  singleQuote: false,
  semi: false,
  trailingComma: "all",
  endOfLine: "lf",
  plugins: [
    require.resolve("prettier-package-json"),
    require.resolve("@trivago/prettier-plugin-sort-imports"),
  ],

  importOrderParserPlugins: [
    "classProperties",
    "decorators-legacy",
    "typescript",
    "jsx",
  ],
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "^@(.*)/(.*)$",
    "^~/(.*)$",
    "^@/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
