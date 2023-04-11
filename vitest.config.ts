import path from "path"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve("./src"),
    },
  },
  plugins: [react()],
  test: {
    include: ["src/**/*.test.ts"],
    deps: {
      external: ["rehype-prism-plus"],
      inline: ["react-avatar-editor"],
    },
  },
})
