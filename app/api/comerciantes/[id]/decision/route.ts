import { NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { decidirSolicitud } from "@/lib/services";
import { esAdmin, manejarError, noAutorizado } from "@/lib/http";

// HU02: aprobar / rechazar (solo administrador)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await esAdmin())) return noAutorizado();
  try {
    const { id } = await params;
    return NextResponse.json(await decidirSolicitud(obtenerRepositorio(), id, await req.json()));
  } catch (e) {
    return manejarError(e);
  }
}
