# MercaOrden — Formalización del comercio mayorista (caso La Parada)

Proyecto Final de Carrera III · USIL 2026-2 · Práctica Calificada 2

Plataforma web para la Municipalidad de Lima y el Mercado Mayorista de Santa Anita que implementa:

| Épica | Historias implementadas | Jira |
|---|---|---|
| E1 · Registro y formalización de comerciantes | HU01 registro con DNI/RUC · HU02 aprobar/rechazar · HU03 asignar puesto · HU04 licencia con QR | MORD-4 |
| E5 · Canal de denuncias anónimas | HU15 denuncia anónima · HU17 seguimiento por código | MORD-8 |

**Producción:** https://pfc3-ruddy.vercel.app · **Jira:** https://margarita-pfc3.atlassian.net/jira/software/projects/MORD/boards/1/backlog

## Stack
- **Frontend + API:** Next.js 16 (App Router, TypeScript) desplegado en **Vercel**
- **Base de datos:** Supabase (PostgreSQL) con Row Level Security
- **Pruebas:** Vitest (unitarias, cobertura v8)
- **CI/CD:** GitHub Actions → lint, tipos, pruebas, Gitleaks, npm audit, CodeQL, deploy en Vercel + smoke test

## Ramas
- `main` → producción (Vercel). Solo recibe cambios por Pull Request desde `test`.
- `test` → integración y pruebas. Cada push ejecuta el pipeline completo.

## Ejecutar localmente
```bash
npm ci
cp .env.example .env.local   # completar valores (sin Supabase usa un repositorio en memoria)
npm run dev
npm test
```

## Variables de entorno (Vercel)
| Variable | Uso |
|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servidor (solo backend, nunca en el navegador) |
| `ADMIN_PASSWORD` | Contraseña del panel `/admin` |
| `SESSION_SECRET` | Secreto HMAC de la cookie de sesión (≥ 32 caracteres) |

## Base de datos
Ejecutar `supabase/schema.sql` en Supabase → SQL Editor.
