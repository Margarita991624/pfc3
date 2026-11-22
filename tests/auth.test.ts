import { beforeAll, describe, expect, it } from "vitest";
import { crearTokenSesion, passwordCorrecta, tokenValido } from "@/lib/auth";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-de-al-menos-32-caracteres!!";
  process.env.ADMIN_PASSWORD = "clave-de-prueba";
});

describe("Sesión de administrador", () => {
  it("valida la contraseña en tiempo constante", () => {
    expect(passwordCorrecta("clave-de-prueba")).toBe(true);
    expect(passwordCorrecta("otra")).toBe(false);
  });
  it("acepta un token firmado vigente y rechaza uno alterado o vencido", () => {
    const ahora = Date.now();
    const t = crearTokenSesion(ahora);
    expect(tokenValido(t, ahora + 1000)).toBe(true);
    expect(tokenValido(t.replace(/.$/, "x"), ahora)).toBe(false);
    expect(tokenValido(t, ahora + 9 * 3600 * 1000)).toBe(false);
    expect(tokenValido(undefined)).toBe(false);
  });
});
