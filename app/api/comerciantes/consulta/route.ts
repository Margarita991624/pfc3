import { NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { consultarSolicitud } from "@/lib/services";
import { manejarError } from "@/lib/http";

// MORD-33: consulta pública del estado de la solicitud con RUC + DNI.
// Se usa POST para que el DNI no quede en la URL, el historial ni los logs.
export async function POST(req: Request) {
  try {
    return NextResponse.json(await consultarSolicitud(obtenerRepositorio(), await req.json()), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return manejarError(e);
  }
}
