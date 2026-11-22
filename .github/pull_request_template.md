## Historia / tarea de Jira
<!-- Ej.: MORD-24 · HU15 Denuncia anónima -->
MORD-

## ¿Qué cambia?
-

## ¿Cómo se probó?
- [ ] `npm run test:coverage` (unitarias con umbral)
- [ ] `npm run test:smoke` (E2E Playwright)
- [ ] Criterios de aceptación (Dado/Cuando/Entonces) verificados

## Seguridad (DevSecOps)
- [ ] Sin secretos en el código (Gitleaks en verde)
- [ ] Sin hallazgos altos de CodeQL
- [ ] `npm run audit:prod` sin vulnerabilidades altas
- [ ] Entradas validadas con Zod y sin datos personales innecesarios

## Definición de Done
- [ ] Job puerta **CI** en verde
- [ ] Revisado por otro integrante
- [ ] Desplegado y verificado (post-deploy en verde) tras el merge a `main`
