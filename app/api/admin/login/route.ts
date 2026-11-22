import { NextResponse } from "next/server";
import { COOKIE_ADMIN, crearTokenSesion, passwordCorrecta } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !passwordCorrecta(password)) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_ADMIN, crearTokenSesion(), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 8 * 3600,
  });
  return res;
}
