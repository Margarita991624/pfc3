import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ErrorDominio } from "./errors";
import { COOKIE_ADMIN, tokenValido } from "./auth";

export function manejarError(e: unknown) {
  if (e instanceof ErrorDominio) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error("Error interno:", e instanceof Error ? e.message : "desconocido");
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}

export async function esAdmin(): Promise<boolean> {
  const jar = await cookies();
  return tokenValido(jar.get(COOKIE_ADMIN)?.value);
}

export const noAutorizado = () => NextResponse.json({ error: "No autorizado" }, { status: 401 });
