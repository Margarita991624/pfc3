import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: ["playwright-report/**", "test-results/**", ".next/**", "node_modules/**", "coverage/**", "next-env.d.ts", "docs/**"] },
];

export default config;
