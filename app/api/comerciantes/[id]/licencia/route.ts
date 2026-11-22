import { after, NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { cambiarEstadoLicencia } from "@/lib/services";
import { esAdmin, manejarError, noAutorizado } from "@/lib/http";
import { correoLicencia } from "@/lib/correos";
import { enviarCorreo } from "@/lib/mailer";

// MORD-36: poner en revisión, suspender, revocar o reactivar una licencia (solo administrador).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await esAdmin())) return noAutorizado();
  try {
    const { id } = await params;
    const c = await cambiarEstadoLicencia(obtenerRepositorio(), id, await req.json());
    const base = new URL(req.url).origin;
    after(() => enviarCorreo(correoLicencia(c, base)));
    return NextResponse.json(c);
  } catch (e) {
    return manejarError(e);
  }
}
