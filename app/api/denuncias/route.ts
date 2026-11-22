import { NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { registrarDenuncia } from "@/lib/services";
import { manejarError } from "@/lib/http";

// HU15: denuncia anónima. No se leen ni registran IP, cabeceras ni cookies del denunciante.
export async function POST(req: Request) {
  try {
    const r = await registrarDenuncia(obtenerRepositorio(), await req.json());
    return NextResponse.json(r, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return manejarError(e);
  }
}
