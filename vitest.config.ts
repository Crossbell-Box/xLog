import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve("./src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    deps: {
      external: ["rehype-prism-plus"],
      inline: ["react-avatar-editor"],
    },
  },
})
