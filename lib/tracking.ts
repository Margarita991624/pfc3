import { randomInt } from "node:crypto";

// Sin O/0/I/1 para evitar confusiones al dictar el código.
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function bloque(n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) s += ALFABETO[randomInt(ALFABETO.length)];
  return s;
}

/** Código de seguimiento aleatorio criptográficamente seguro, no derivado de datos del denunciante (HU15). */
export function generarCodigoSeguimiento(): string {
  return `DEN-${bloque(4)}-${bloque(4)}`;
}

/** Código de licencia que se codifica en el QR (HU02/HU04). */
export function generarCodigoLicencia(): string {
  return `LIC-${bloque(6)}`;
}
