import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { obtenerRepositorio } from "@/lib/repo";
import { verificarLicencia } from "@/lib/services";
import { manejarError } from "@/lib/http";

// HU04: verificación pública de licencia + QR
export async function GET(req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  try {
    const { codigo } = await params;
    const datos = await verificarLicencia(obtenerRepositorio(), codigo);
    const url = new URL(`/licencia/${datos.codigoLicencia}`, req.url).toString();
    const qr = await QRCode.toDataURL(url, { margin: 1, width: 220 });
    return NextResponse.json({ ...datos, qr });
  } catch (e) {
    return manejarError(e);
  }
}
