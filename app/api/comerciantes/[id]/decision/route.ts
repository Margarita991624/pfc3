import { after, NextResponse } from "next/server";
import { correoDecision } from "@/lib/correos";
import { enviarCorreo } from "@/lib/mailer";
import { obtenerRepositorio } from "@/lib/repo";
import { decidirSolicitud } from "@/lib/services";
import { esAdmin, manejarError, noAutorizado } from "@/lib/http";

// HU02: aprobar / rechazar (solo administrador)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await esAdmin())) return noAutorizado();
  try {
    const { id } = await params;
    const c = await decidirSolicitud(obtenerRepositorio(), id, await req.json());
    const base = new URL(req.url).origin;
    after(() => enviarCorreo(correoDecision(c, base))); // MORD-34: aviso al comerciante
    return NextResponse.json(c);
  } catch (e) {
    return manejarError(e);
  }
}
