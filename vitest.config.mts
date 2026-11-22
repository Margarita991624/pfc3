import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, ".") } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    reporters: ["default", "junit"],
    outputFile: { junit: "test-results/junit.xml" },
    coverage: { provider: "v8", include: ["lib/**/*.ts"], exclude: ["lib/supabaseRepo.ts", "lib/repo.ts", "lib/http.ts"], reporter: ["text", "json-summary"] },
  },
});
