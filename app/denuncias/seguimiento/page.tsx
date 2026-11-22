"use client";
import { useState } from "react";

type Resultado = { codigo: string; categoria: string; estado: string; actualizadoEn: string };

export default function Seguimiento() {
  const [res, setRes] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function consultar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRes(null);
    setError(null);
    const codigo = String(new FormData(e.currentTarget).get("codigo") ?? "").trim().toUpperCase();
    const r = await fetch(`/api/denuncias/${encodeURIComponent(codigo)}`, { credentials: "omit" });
    const j = await r.json();
    if (r.ok) setRes(j);
    else setError(j.error);
  }

  return (
    <>
      <h1>Seguimiento de denuncia</h1>
      <p className="sub">HU17 · Ingresa el código que recibiste al denunciar.</p>
      <form className="card" onSubmit={consultar}>
        <label htmlFor="codigo">Código</label>
        <input id="codigo" name="codigo" placeholder="DEN-XXXX-XXXX" required />
        <p><button>Consultar</button></p>
        {error && <div className="err">{error}</div>}
        {res && (
          <div className="ok">
            <b>{res.codigo}</b> · {res.categoria}<br />
            Estado: <b>{res.estado}</b> · Última actualización: {new Date(res.actualizadoEn).toLocaleString("es-PE")}
          </div>
        )}
      </form>
    </>
  );
}
