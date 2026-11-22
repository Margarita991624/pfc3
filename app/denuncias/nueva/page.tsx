"use client";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIAS_DENUNCIA } from "@/lib/validation";

export default function NuevaDenuncia() {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const datos = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch("/api/denuncias", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos), credentials: "omit" });
    const j = await r.json();
    setEnviando(false);
    if (r.ok) setCodigo(j.codigo);
    else setError(j.error);
  }

  if (codigo)
    return (
      <div className="card">
        <h1>Denuncia registrada</h1>
        <p>Guarda este código. Es la única forma de consultar tu denuncia; no está asociado a tu identidad.</p>
        <p className="codigo">{codigo}</p>
        <Link className="btn" href="/denuncias/seguimiento">Consultar estado</Link>
      </div>
    );

  return (
    <>
      <h1>Denuncia anónima</h1>
      <p className="sub">HU15 · No pedimos nombre, DNI ni teléfono. No se guarda tu dirección IP.</p>
      <form className="card" onSubmit={enviar}>
        <label htmlFor="categoria">¿Qué ocurrió?</label>
        <select id="categoria" name="categoria">{CATEGORIAS_DENUNCIA.map((c) => <option key={c}>{c}</option>)}</select>
        <label htmlFor="ubicacion">Ubicación (bloque, puerta o zona)</label>
        <input id="ubicacion" name="ubicacion" required />
        <label htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" required />
        <p className="aviso">No escribas datos que te identifiquen. En una emergencia llama al 105 (PNP).</p>
        <button disabled={enviando}>{enviando ? "Enviando…" : "Enviar denuncia"}</button>
        {error && <div className="err">{error}</div>}
      </form>
    </>
  );
}
