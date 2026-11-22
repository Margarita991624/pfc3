"use client";
import { useState } from "react";
import { GIROS } from "@/lib/validation";
import { Alerta, Check, Documento, Escudo, Qr, Tienda } from "../../iconos";

export default function RegistroComerciante() {
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setEnviando(true);
    setMsg(null);
    const datos = Object.fromEntries(new FormData(form));
    const r = await fetch("/api/comerciantes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
    const j = await r.json();
    setEnviando(false);
    if (r.ok) {
      setMsg({ ok: true, texto: `Solicitud enviada. Estado: ${j.estado}. La administración revisará tus datos.` });
      form.reset();
    } else setMsg({ ok: false, texto: j.error });
  }

  return (
    <div className="aparece">
      <div className="cabecera">
        <span className="ceja">Formalización <span className="chip">HU01</span></span>
        <h1>Registro de comerciante mayorista</h1>
        <p className="sub">Tu solicitud queda en estado «Pendiente» hasta que la administración la apruebe. Te tomará menos de dos minutos.</p>
      </div>

      <div className="dos">
        <form className="card" onSubmit={enviar}>
          <h3 style={{ display: "flex", gap: 10, alignItems: "center" }}><Documento /> Datos del titular</h3>
          <div className="grid">
            <div><label htmlFor="nombres">Nombres y apellidos</label><input id="nombres" name="nombres" placeholder="Rosa Quispe Huamán" autoComplete="name" required /></div>
            <div><label htmlFor="dni">DNI</label><input id="dni" name="dni" inputMode="numeric" maxLength={8} placeholder="8 dígitos" required /></div>
          </div>

          <h3 style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 28 }}><Tienda /> Datos del negocio</h3>
          <div className="grid">
            <div><label htmlFor="ruc">RUC</label><input id="ruc" name="ruc" inputMode="numeric" maxLength={11} placeholder="10XXXXXXXXX o 20XXXXXXXXX" required /></div>
            <div><label htmlFor="razonSocial">Razón social o nombre comercial</label><input id="razonSocial" name="razonSocial" placeholder="Frutas Rosita" required /></div>
            <div><label htmlFor="giro">Giro</label><select id="giro" name="giro">{GIROS.map((g) => <option key={g}>{g}</option>)}</select></div>
          </div>

          <h3 style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 28 }}>Contacto</h3>
          <div className="grid">
            <div><label htmlFor="email">Correo</label><input id="email" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" required /></div>
            <div><label htmlFor="telefono">Celular</label><input id="telefono" name="telefono" inputMode="numeric" maxLength={9} placeholder="9XXXXXXXX" autoComplete="tel" required /></div>
          </div>

          <div className="acciones">
            <button disabled={enviando}>{enviando ? "Enviando…" : "Enviar solicitud"}</button>
            <span className="aviso">Tus datos se usan solo para tu licencia.</span>
          </div>
          {msg && (
            <div className={msg.ok ? "ok" : "err"} role="status">
              {msg.ok ? <Check /> : <Alerta />}<span>{msg.texto}</span>
            </div>
          )}
        </form>

        <aside className="lado">
          <h3>¿Qué obtienes?</h3>
          <ul className="lista">
            <li><span className="ico"><Check /></span><span><b>Validación inmediata</b><br />Comprobamos el dígito verificador de tu RUC según SUNAT.</span></li>
            <li><span className="ico"><Tienda /></span><span><b>Puesto asignado</b><br />La administración te asigna un puesto libre según tu giro.</span></li>
            <li><span className="ico"><Qr /></span><span><b>Licencia digital con QR</b><br />Verificable por cualquier inspector o cliente.</span></li>
            <li><span className="ico"><Escudo /></span><span><b>Datos protegidos</b><br />Tu documento y tu correo nunca aparecen en la licencia pública.</span></li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
