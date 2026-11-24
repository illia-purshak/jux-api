import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

if (existsSync(".env")) process.loadEnvFile(".env");
if (!process.env.POSTGRES_DATABASE?.endsWith("_test"))
  process.env.POSTGRES_DATABASE = `${process.env.POSTGRES_DATABASE}_test`;

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    env: { NODE_ENV: "production" },
    root: "./",
    include: ["test/e2e/**/*.e2e-spec.ts"],
    globalSetup: ["./test/e2e/e2e.global-setup.ts"],
    fileParallelism: false,
  },
});
