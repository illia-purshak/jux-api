import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    env: { NODE_ENV: "production" },
    root: "./",
    include: ["test/unit/**/*.spec.ts"],
  },
});
