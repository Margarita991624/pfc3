"use client";
import { useState } from "react";
import { Alerta, Escudo, Lupa } from "../../iconos";

type Resultado = { codigo: string; categoria: string; estado: string; actualizadoEn: string };

// Etapas del caso. Se muestran con CSS (data-paso) para que el estado actual aparezca una sola vez como texto.
const ETAPAS = ["Recibida", "En revisión", "Derivada", "Cerrada"];

export default function Seguimiento() {
  const [res, setRes] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  async function consultar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRes(null);
    setError(null);
    setBuscando(true);
    const codigo = String(new FormData(e.currentTarget).get("codigo") ?? "").trim().toUpperCase();
    const r = await fetch(`/api/denuncias/${encodeURIComponent(codigo)}`, { credentials: "omit" });
    const j = await r.json();
    setBuscando(false);
    if (r.ok) setRes(j);
    else setError(j.error);
  }

  const actual = res ? ETAPAS.indexOf(res.estado) : -1;

  return (
    <div className="aparece" style={{ maxWidth: 760, margin: "auto" }}>
      <div className="cabecera" style={{ textAlign: "center" }}>
        <span className="ceja">Seguimiento <span className="chip">HU17</span></span>
        <h1>Seguimiento de denuncia</h1>
        <p className="sub" style={{ marginInline: "auto" }}>Ingresa el código que te dimos al denunciar. Solo tú lo conoces.</p>
      </div>

      <form className="card" onSubmit={consultar}>
        <label htmlFor="codigo">Código</label>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input id="codigo" name="codigo" placeholder="DEN-XXXX-XXXX" className="mono" style={{ flex: "1 1 260px", fontSize: 18, letterSpacing: 2, textTransform: "uppercase" }} autoComplete="off" required />
          <button disabled={buscando}><Lupa /> Consultar</button>
        </div>
        {error && <div className="err" role="alert"><Alerta /><span>{error}</span></div>}
        {res && (
          <div className="resultado aparece">
            <div className="fila">
              <div>
                <div className="codigo" style={{ fontSize: 22 }}>{res.codigo}</div>
                <div className="aviso">{res.categoria} · actualizado {new Date(res.actualizadoEn).toLocaleString("es-PE")}</div>
              </div>
              <span className={`tag ${res.estado.replace(/\s/g, "")}`}>Estado: {res.estado}</span>
            </div>
            <ol className="linea" aria-label="Etapas del caso">
              {ETAPAS.map((paso, i) => (
                <li key={paso} data-paso={paso} className={i < actual ? "hecho" : i === actual ? "actual" : ""} aria-current={i === actual ? "step" : undefined}><i /></li>
              ))}
            </ol>
          </div>
        )}
      </form>
      <p className="aviso" style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginTop: 18 }}><Escudo size={16} /> La consulta no requiere cuenta y no registra tu identidad.</p>
    </div>
  );
}
