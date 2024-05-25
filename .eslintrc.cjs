module.exports = {
  extends: [
    "next/core-web-vitals",
    "plugin:import/recommended",
    "plugin:react/recommended",
    "plugin:tailwindcss/recommended",
    "plugin:react-hooks/recommended",
  ],
  root: true,
  settings: {
    "import/resolver": {
      node: { extensions: [".js", ".mjs", ".ts", ".d.ts"] },
    },
    tailwindcss: {
      callees: ["classnames", "clsx", "ctl", "cn"],
      whitelist: [
        "xlog-.+",
        "text-feature-",
        "drag-handle",
        "no-optimization",
        "qrcode",
        "share-options",
        "preserve-3d",
        "achievement-group",
        "comment",
      ],
    },
  },
  plugins: ["unused-imports"],
  rules: {
    "unused-imports/no-unused-imports": "error",
    "import/named": "off",
    "import/no-anonymous-default-export": "off",
    "import/no-named-as-default": "off",
    "react/react-in-jsx-scope": "off",
    "react-hooks/exhaustive-deps":
      process.env.NODE_ENV === "production" ? "off" : "warn",
    "import/no-named-as-default-member": "off",
    "react/no-unknown-property": ["error", { ignore: ["tw"] }],
    "tailwindcss/classnames-order": "off",
  },
}
