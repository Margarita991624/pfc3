"use client";
import { useState } from "react";
import { GIROS } from "@/lib/validation";

export default function RegistroComerciante() {
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setMsg(null);
    const datos = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch("/api/comerciantes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
    const j = await r.json();
    setEnviando(false);
    if (r.ok) {
      setMsg({ ok: true, texto: `Solicitud enviada. Estado: ${j.estado}. La administración revisará tus datos.` });
      e.currentTarget.reset();
    } else setMsg({ ok: false, texto: j.error });
  }

  return (
    <>
      <h1>Registro de comerciante mayorista</h1>
      <p className="sub">HU01 · Tu solicitud queda en estado «Pendiente» hasta que la administración la apruebe.</p>
      <form className="card" onSubmit={enviar}>
        <div className="grid">
          <div><label htmlFor="nombres">Nombres y apellidos</label><input id="nombres" name="nombres" required /></div>
          <div><label htmlFor="dni">DNI</label><input id="dni" name="dni" inputMode="numeric" maxLength={8} required /></div>
          <div><label htmlFor="ruc">RUC</label><input id="ruc" name="ruc" inputMode="numeric" maxLength={11} required /></div>
          <div><label htmlFor="razonSocial">Razón social o nombre comercial</label><input id="razonSocial" name="razonSocial" required /></div>
          <div><label htmlFor="giro">Giro</label><select id="giro" name="giro">{GIROS.map((g) => <option key={g}>{g}</option>)}</select></div>
          <div><label htmlFor="email">Correo</label><input id="email" name="email" type="email" required /></div>
          <div><label htmlFor="telefono">Celular</label><input id="telefono" name="telefono" inputMode="numeric" maxLength={9} required /></div>
        </div>
        <p style={{ marginTop: 18 }}><button disabled={enviando}>{enviando ? "Enviando…" : "Enviar solicitud"}</button></p>
        {msg && <div className={msg.ok ? "ok" : "err"}>{msg.texto}</div>}
      </form>
    </>
  );
}
