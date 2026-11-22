import { NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { listarDenunciasAdmin, registrarDenuncia } from "@/lib/services";
import { esAdmin, manejarError, noAutorizado } from "@/lib/http";

// HU15: denuncia anónima. No se leen ni registran IP, cabeceras ni cookies del denunciante.
export async function POST(req: Request) {
  try {
    const r = await registrarDenuncia(obtenerRepositorio(), await req.json());
    return NextResponse.json(r, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return manejarError(e);
  }
}

// HU16: bandeja de denuncias, solo para el administrador autenticado.
export async function GET() {
  if (!(await esAdmin())) return noAutorizado();
  try {
    return NextResponse.json(await listarDenunciasAdmin(obtenerRepositorio()), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return manejarError(e);
  }
}
