import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas E2E de humo (@smoke): levantan el build de producción con el repositorio
 * en memoria (sin credenciales reales) y recorren los flujos críticos de E1 y E5.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "e2e",
  // Carpeta propia: Playwright limpia su outputDir y no debe borrar el JUnit de Vitest (test-results/).
  outputDir: "e2e-results",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }], ["junit", { outputFile: "test-results/e2e-junit.xml" }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}) } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      // Solo para el servidor efímero de pruebas; producción usa secretos de Vercel.
      SESSION_SECRET: "e2e-solo-pruebas-no-usar-en-produccion-000000",
      ADMIN_PASSWORD: "e2e-admin-pruebas",
      SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
    },
  },
});
