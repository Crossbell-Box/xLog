module.exports = {
  extends: ["next/core-web-vitals", "plugin:import/recommended"],
  root: true,
  settings: {
    "import/resolver": {
      node: { extensions: [".js", ".mjs", ".ts", ".d.ts"] },
    },
  },
  plugins: ["unused-imports"],
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "import/named": "off",
    "import/no-anonymous-default-export": "off",
    "import/no-named-as-default": "off",
  },
}
