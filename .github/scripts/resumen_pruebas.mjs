// Publica en el resumen del job una tabla con los resultados de Vitest, Playwright y la cobertura.
import { existsSync, readFileSync, appendFileSync } from "node:fs";

const contar = (archivo) => {
  if (!existsSync(archivo)) return null;
  const xml = readFileSync(archivo, "utf8");
  const attr = (k) => Number(xml.match(new RegExp(`${k}="(\\d+)"`))?.[1] ?? 0);
  return { tests: attr("tests"), failures: attr("failures"), errors: attr("errors") };
};
const fila = (nombre, r) => `| ${nombre} | ${r ? r.tests : "–"} | ${r ? r.failures : "–"} | ${r ? r.errors : "–"} |`;

const lineas = [
  "## Resultados de pruebas",
  "",
  "| Suite | Pruebas | Fallidas | Errores |",
  "|---|---|---|---|",
  fila("Unitarias (Vitest)", contar("test-results/junit.xml")),
  fila("E2E de humo (Playwright)", contar("test-results/e2e-junit.xml")),
];
if (existsSync("coverage/coverage-summary.json")) {
  const t = JSON.parse(readFileSync("coverage/coverage-summary.json", "utf8")).total;
  lineas.push("", `**Cobertura de lib/:** líneas ${t.lines.pct}% · ramas ${t.branches.pct}% · funciones ${t.functions.pct}% (umbral 90 / 70 / 85)`);
}
const salida = lineas.join("\n") + "\n";
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, salida);
console.log(salida);
