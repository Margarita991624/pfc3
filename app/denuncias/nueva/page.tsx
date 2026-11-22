"use client";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIAS_DENUNCIA } from "@/lib/validation";
import { Alerta, Candado, Check, Copiar, Lupa, Ojo, Telefono } from "../../iconos";

export default function NuevaDenuncia() {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);

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

  async function copiar() {
    if (!codigo) return;
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  if (codigo)
    return (
      <div className="boleto aparece">
        <div className="check"><Check size={30} /></div>
        <h1>Denuncia registrada</h1>
        <p className="aviso" style={{ fontSize: 15, marginTop: 10 }}>Guarda este código. Es la única forma de consultar tu denuncia; no está asociado a tu identidad.</p>
        <div className="marco">
          <div className="aviso" style={{ textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700, fontSize: 11 }}>Tu código de seguimiento</div>
          <p className="codigo" style={{ margin: "8px 0 0" }}>{codigo}</p>
        </div>
        <div className="acciones" style={{ justifyContent: "center" }}>
          <button type="button" className="sec" onClick={copiar}><Copiar /> {copiado ? "¡Copiado!" : "Copiar código"}</button>
          <Link className="btn" href="/denuncias/seguimiento"><Lupa /> Consultar estado</Link>
        </div>
      </div>
    );

  return (
    <div className="aparece">
      <div className="cabecera">
        <span className="ceja">Canal anónimo <span className="chip">HU15</span></span>
        <h1>Denuncia anónima</h1>
        <p className="sub">No pedimos nombre, DNI ni teléfono. No se guarda tu dirección IP.</p>
      </div>

      <div className="dos">
        <form className="card" onSubmit={enviar}>
          <div className="privacidad"><Ojo size={22} /><span>Estás en modo anónimo: este formulario no envía cookies ni datos de tu dispositivo.</span></div>
          <label htmlFor="categoria">¿Qué ocurrió?</label>
          <select id="categoria" name="categoria">{CATEGORIAS_DENUNCIA.map((c) => <option key={c}>{c}</option>)}</select>
          <label htmlFor="ubicacion">Ubicación (bloque, puerta o zona)</label>
          <input id="ubicacion" name="ubicacion" placeholder="Ej.: Bloque B, puerta 3" required />
          <label htmlFor="descripcion">Descripción</label>
          <textarea id="descripcion" name="descripcion" placeholder="Cuenta qué pasó, cuándo y con qué frecuencia. Evita nombres propios." required />
          <p className="aviso">No escribas datos que te identifiquen.</p>
          <div className="acciones">
            <button className="peligro" disabled={enviando}>{enviando ? "Enviando…" : "Enviar denuncia"}</button>
          </div>
          {error && <div className="err" role="alert"><Alerta /><span>{error}</span></div>}
          <div className="emergencia"><Telefono /><span>¿Estás en peligro ahora mismo? Llama al <b>105</b> (PNP).</span></div>
        </form>

        <aside className="lado">
          <h3>Cómo protegemos tu identidad</h3>
          <ul className="lista">
            <li><span className="ico"><Ojo /></span><span><b>Sin rastro técnico</b><br />No almacenamos IP, navegador ni ubicación.</span></li>
            <li><span className="ico"><Candado /></span><span><b>Acceso restringido</b><br />La base de datos solo responde al servidor con políticas RLS.</span></li>
            <li><span className="ico"><Lupa /></span><span><b>Código aleatorio</b><br />Generado con criptografía segura: imposible de adivinar.</span></li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
