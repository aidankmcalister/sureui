import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    exclude: ["**/node_modules/**", ".claude/**"],
    coverage: { provider: "v8", include: ["components/ui/sureui/**"] },
  },
})
