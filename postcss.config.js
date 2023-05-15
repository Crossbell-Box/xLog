module.exports = {
  plugins: {
    "postcss-import": {},
    tailwindcss: {},
    "postcss-prune-var": { skip: ["node_modules/**"] },
    autoprefixer: {},
  },
}
