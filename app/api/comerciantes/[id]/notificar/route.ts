import { NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { esAdmin, manejarError, noAutorizado } from "@/lib/http";
import { correoSegunEstado } from "@/lib/correos";
import { correoActivo, enviarCorreo } from "@/lib/mailer";

// MORD-34: el administrador reenvía al comerciante el aviso de su estado actual.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await esAdmin())) return noAutorizado();
  try {
    const { id } = await params;
    const c = await obtenerRepositorio().buscarComerciantePorId(id);
    if (!c) return NextResponse.json({ error: "Comerciante no encontrado" }, { status: 404 });
    if (!correoActivo()) return NextResponse.json({ error: "El envío de correos no está configurado" }, { status: 503 });
    const correo = correoSegunEstado(c, new URL(req.url).origin);
    const ok = await enviarCorreo(correo);
    if (!ok) return NextResponse.json({ error: "No se pudo enviar el correo. Inténtalo más tarde." }, { status: 502 });
    return NextResponse.json({ enviado: true, asunto: correo.asunto });
  } catch (e) {
    return manejarError(e);
  }
}
