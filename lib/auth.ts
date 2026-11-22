import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_ADMIN = "mo_admin";
const DURACION_MS = 8 * 60 * 60 * 1000; // 8 horas

function secreto(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET no configurado (mín. 32 caracteres)");
  return s;
}

function firmar(payload: string): string {
  return createHmac("sha256", secreto()).update(payload).digest("base64url");
}

function igualSeguro(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function passwordCorrecta(intento: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  return igualSeguro(intento, real);
}

/** Token de sesión firmado con HMAC-SHA256: "exp.firma". */
export function crearTokenSesion(ahora = Date.now()): string {
  const exp = String(ahora + DURACION_MS);
  return `${exp}.${firmar(exp)}`;
}

export function tokenValido(token: string | undefined, ahora = Date.now()): boolean {
  if (!token) return false;
  const [exp, firma] = token.split(".");
  if (!exp || !firma) return false;
  if (!igualSeguro(firma, firmar(exp))) return false;
  return Number(exp) > ahora;
}
