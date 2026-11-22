import { NextResponse } from "next/server";
import { obtenerRepositorio } from "@/lib/repo";
import { esAdmin, manejarError, noAutorizado } from "@/lib/http";

export async function GET() {
  if (!(await esAdmin())) return noAutorizado();
  try {
    return NextResponse.json(await obtenerRepositorio().listarPuestos());
  } catch (e) {
    return manejarError(e);
  }
}
