import { NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { registrarComerciante } from "@/lib/services";
import { esAdmin, manejarError, noAutorizado } from "@/lib/http";
import type { EstadoSolicitud } from "@/lib/types";

// HU01: registro público de comerciantes
export async function POST(req: Request) {
  try {
    const c = await registrarComerciante(obtenerRepositorio(), await req.json());
    return NextResponse.json({ id: c.id, estado: c.estado }, { status: 201 });
  } catch (e) {
    return manejarError(e);
  }
}

// HU02: listado para el administrador
export async function GET(req: Request) {
  if (!(await esAdmin())) return noAutorizado();
  try {
    const estado = new URL(req.url).searchParams.get("estado") as EstadoSolicitud | null;
    return NextResponse.json(await obtenerRepositorio().listarComerciantes(estado ?? undefined));
  } catch (e) {
    return manejarError(e);
  }
}
