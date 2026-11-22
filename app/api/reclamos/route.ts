import { after, NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { listarReclamosAdmin, registrarReclamo } from "@/lib/services";
import { esAdmin, manejarError, noAutorizado } from "@/lib/http";
import { correosReclamo } from "@/lib/correos";
import { enviarCorreo } from "@/lib/mailer";
import { CONTACTO_EMAIL } from "@/lib/contacto";

// MORD-35: Libro de Reclamaciones virtual. Guarda la hoja y envía la constancia al
// consumidor y el aviso al centro de contacto (después de responder).
export async function POST(req: Request) {
  try {
    const r = await registrarReclamo(obtenerRepositorio(), await req.json());
    after(async () => { for (const c of correosReclamo(r, CONTACTO_EMAIL)) await enviarCorreo(c); });
    return NextResponse.json({ codigo: r.codigo, tipo: r.tipo, creadoEn: r.creadoEn }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return manejarError(e);
  }
}

// MORD-35: bandeja del Libro de Reclamaciones (solo administrador).
export async function GET() {
  if (!(await esAdmin())) return noAutorizado();
  try {
    return NextResponse.json(await listarReclamosAdmin(obtenerRepositorio()), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return manejarError(e);
  }
}
