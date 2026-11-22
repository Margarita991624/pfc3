import { NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { consultarDenuncia } from "@/lib/services";
import { manejarError } from "@/lib/http";

// HU17: seguimiento por código
export async function GET(_req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  try {
    const { codigo } = await params;
    return NextResponse.json(await consultarDenuncia(obtenerRepositorio(), codigo), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return manejarError(e);
  }
}
