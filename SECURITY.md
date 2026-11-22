# Política de seguridad · MercaOrden

## Reportar una vulnerabilidad
No abras un issue público. Usa **Security → Report a vulnerability** (GitHub Private Vulnerability Reporting) con pasos para reproducir, impacto y versión afectada. Respondemos en un máximo de 72 horas.

## Controles en el ciclo DevSecOps
| Fase | Control | Dónde |
|---|---|---|
| Code | Convenciones de PR con clave de Jira, revisión obligatoria | `ci.yml` · Convenciones de la PR |
| Build | `npm ci` con lockfile, acciones fijadas por SHA, permisos mínimos | todos los workflows |
| Test | Vitest con umbral de cobertura, Playwright E2E @smoke | `ci.yml` · Web |
| SAST | CodeQL `security-extended`; falla con severidad ≥ 7.0 | `codeql.yml` |
| Secretos | Gitleaks 8.30.1 verificado por SHA-256 + reglas de Supabase | `gitleaks.yml`, `.gitleaks.toml` |
| SCA | `npm audit --omit=dev --audit-level=high`, Dependabot semanal | `ci.yml`, `dependabot.yml` |
| SBOM | CycloneDX de producción en cada versión de `main` | `sbom.yml` |
| Release | Job puerta **CI** como único check obligatorio | `ci.yml` · CI |
| Deploy | Secretos cifrados en Vercel, HTTPS + HSTS + CSP | Vercel, `next.config.ts` |
| Operate | RLS en Supabase, `service_role` solo en el servidor, cookie HMAC httpOnly | `supabase/schema.sql`, `lib/auth.ts` |
| Monitor | Smoke test, cabeceras, control de acceso y DAST OWASP ZAP tras cada despliegue | `post-deploy.yml` |

## Datos sensibles
La denuncia anónima (HU15) no almacena identidad, IP ni user-agent; el código de seguimiento es aleatorio (`crypto.randomInt`).
