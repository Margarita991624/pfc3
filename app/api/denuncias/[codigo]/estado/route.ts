import { NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { cambiarEstadoDenuncia } from "@/lib/services";
import { esAdmin, manejarError, noAutorizado } from "@/lib/http";

// HU16: revisar, derivar (PNP / Fiscalía) o cerrar una denuncia (solo administrador).
export async function POST(req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  if (!(await esAdmin())) return noAutorizado();
  try {
    const { codigo } = await params;
    return NextResponse.json(await cambiarEstadoDenuncia(obtenerRepositorio(), codigo, await req.json()));
  } catch (e) {
    return manejarError(e);
  }
}
