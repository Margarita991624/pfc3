"use client";
import { useState } from "react";
import { CATEGORIAS_REPORTE } from "@/lib/validation";
import { Alerta, Check } from "./iconos";

/** MORD-36: formulario anónimo para reportar una falta de un comercio con licencia. */
export function FormReporte({ codigoLicencia }: { codigoLicencia?: string }) {
  const [hecho, setHecho] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const datos = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch("/api/reportes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos), credentials: "omit" });
    const j = await r.json();
    setEnviando(false);
    if (r.ok) setHecho(j.codigo);
    else setError(j.error);
  }

  if (hecho)
    return (
      <div className="ok" role="status"><Check /><span><b>¡Gracias! Recibimos tu reporte {hecho}.</b> La administración del mercado lo revisará y, si corresponde, pondrá la licencia en revisión. No guardamos tus datos.</span></div>
    );

  return (
    <form onSubmit={enviar}>
      {codigoLicencia ? <input type="hidden" name="codigoLicencia" value={codigoLicencia} /> : (
        <>
          <label htmlFor="codigoLicencia">Código de licencia del comercio</label>
          <input id="codigoLicencia" name="codigoLicencia" placeholder="LIC-XXXXXX (está debajo del QR del puesto)" className="mono" style={{ textTransform: "uppercase" }} required />
        </>
      )}
      <label htmlFor="categoria">¿Qué falta viste?</label>
      <select id="categoria" name="categoria">{CATEGORIAS_REPORTE.map((c) => <option key={c}>{c}</option>)}</select>
      <label htmlFor="descripcionReporte">Cuéntanos qué pasó</label>
      <textarea id="descripcionReporte" name="descripcion" placeholder="Ej.: la balanza marca 200 g de más en cada kilo" required />
      <p className="aviso">Tu reporte es anónimo: no pedimos nombre, DNI ni teléfono.</p>
      <div className="acciones"><button className="peligro grande" disabled={enviando}>{enviando ? "Enviando…" : "Enviar reporte"}</button></div>
      {error && <div className="err" role="alert"><Alerta /><span>{error}</span></div>}
    </form>
  );
}
