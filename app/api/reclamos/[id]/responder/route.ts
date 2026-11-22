import { NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { responderReclamo } from "@/lib/services";
import { esAdmin, manejarError, noAutorizado } from "@/lib/http";
import { correoRespuestaReclamo } from "@/lib/correos";
import { enviarCorreo } from "@/lib/mailer";

// MORD-35: responder una hoja del Libro de Reclamaciones y enviar la respuesta al consumidor.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await esAdmin())) return noAutorizado();
  try {
    const { id } = await params;
    const r = await responderReclamo(obtenerRepositorio(), id, await req.json());
    const enviado = await enviarCorreo(correoRespuestaReclamo(r));
    return NextResponse.json({ id: r.id, estado: r.estado, enviado });
  } catch (e) {
    return manejarError(e);
  }
}
