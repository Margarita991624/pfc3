import { NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { atenderReporte } from "@/lib/services";
import { esAdmin, manejarError, noAutorizado } from "@/lib/http";

// MORD-36: marcar un reporte como atendido (solo administrador).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await esAdmin())) return noAutorizado();
  try {
    const { id } = await params;
    return NextResponse.json(await atenderReporte(obtenerRepositorio(), id));
  } catch (e) {
    return manejarError(e);
  }
}
