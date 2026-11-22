"""Rechaza hallazgos de CodeQL con severidad de seguridad alta o crítica.

Lee los archivos SARIF generados por `github/codeql-action/analyze` y falla si
algún resultado tiene `security-severity` >= 7.0 (alta) según CVSS.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

UMBRAL = 7.0


def severidad(regla: dict) -> float:
    try:
        return float(regla.get("properties", {}).get("security-severity", 0))
    except (TypeError, ValueError):
        return 0.0


def hallazgos_graves(sarif: dict) -> list[str]:
    graves: list[str] = []
    for run in sarif.get("runs", []):
        reglas = {r.get("id"): r for r in run.get("tool", {}).get("driver", {}).get("rules", [])}
        for res in run.get("results", []):
            if res.get("suppressions"):
                continue
            regla = reglas.get(res.get("ruleId"), {})
            sev = severidad(regla)
            if sev >= UMBRAL:
                loc = res.get("locations", [{}])[0].get("physicalLocation", {})
                archivo = loc.get("artifactLocation", {}).get("uri", "?")
                linea = loc.get("region", {}).get("startLine", "?")
                graves.append(f"{res.get('ruleId')} (severidad {sev}) en {archivo}:{linea}")
    return graves


def main(directorio: str) -> int:
    archivos = sorted(Path(directorio).glob("*.sarif"))
    if not archivos:
        print("::error::No se encontraron archivos SARIF de CodeQL")
        return 1
    graves = [g for a in archivos for g in hallazgos_graves(json.loads(a.read_text(encoding="utf-8")))]
    for g in graves:
        print(f"::error::CodeQL {g}")
    print(f"CodeQL: {len(graves)} hallazgo(s) alto(s) o crítico(s).")
    return 1 if graves else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "."))
