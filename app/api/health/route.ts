import { NextResponse } from "next/server";
import { modoDemo } from "@/lib/repo";

// Usado por el monitoreo (fase Monitor del ciclo DevSecOps)
export async function GET() {
  return NextResponse.json({ status: "ok", servicio: "mercaorden", baseDatos: modoDemo() ? "memoria" : "supabase", hora: new Date().toISOString() });
}
