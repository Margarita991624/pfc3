import { NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { listarReportesAdmin, registrarReporte } from "@/lib/services";
import { esAdmin, manejarError, noAutorizado } from "@/lib/http";

// MORD-36: reporte anónimo de una falta en un comercio (público). No se guarda identidad.
export async function POST(req: Request) {
  try {
    return NextResponse.json(await registrarReporte(obtenerRepositorio(), await req.json()), { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return manejarError(e);
  }
}

// MORD-36: bandeja de reportes (solo administrador).
export async function GET() {
  if (!(await esAdmin())) return noAutorizado();
  try {
    return NextResponse.json(await listarReportesAdmin(obtenerRepositorio()), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return manejarError(e);
  }
}
