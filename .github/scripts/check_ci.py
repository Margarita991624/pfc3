"""Job puerta del CI: decide si el pipeline completo es aceptable.

Recibe en NEEDS_JSON el contexto `needs` de GitHub Actions. Falla si cualquier job
falló o fue cancelado. Solo admite omisiones justificadas por el tipo de evento
(jobs exclusivos de pull_request en un push). Los controles de seguridad
(gitleaks, codeql, web) nunca pueden omitirse.
"""
from __future__ import annotations

import json
import os
import sys

OBLIGATORIOS = {"gitleaks", "codeql", "web"}
SOLO_PR = {"convenciones", "archivos"}


def evaluar(needs: dict, evento: str, autor: str = "") -> list[str]:
    errores: list[str] = []
    for job in sorted(OBLIGATORIOS - needs.keys()):
        errores.append(f"{job}: el job obligatorio no forma parte del CI")
    for job, info in sorted(needs.items()):
        resultado = info.get("result")
        if resultado == "success":
            continue
        if resultado == "skipped":
            if job in OBLIGATORIOS:
                errores.append(f"{job}: control obligatorio omitido")
            elif job in SOLO_PR and evento != "pull_request":
                continue
            elif job == "convenciones" and autor == "Bot":
                continue
            else:
                errores.append(f"{job}: omitido sin justificación")
            continue
        errores.append(f"{job}: {resultado}")
    return errores


def main() -> int:
    needs = json.loads(os.environ.get("NEEDS_JSON", "{}"))
    errores = evaluar(needs, os.environ.get("EVENT_NAME", ""), os.environ.get("AUTHOR_TYPE", ""))
    resumen = os.environ.get("GITHUB_STEP_SUMMARY")
    lineas = ["## Job puerta · resultado de los controles", "", "| Job | Resultado |", "|---|---|"]
    lineas += [f"| {j} | {i.get('result')} |" for j, i in sorted(needs.items())]
    if resumen:
        with open(resumen, "a", encoding="utf-8") as f:
            f.write("\n".join(lineas) + "\n")
    for e in errores:
        print(f"::error::{e}")
    print("CI aprobado." if not errores else f"CI rechazado: {len(errores)} problema(s).")
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
