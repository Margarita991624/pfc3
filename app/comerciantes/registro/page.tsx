"use client";
import Link from "next/link";
import { useState } from "react";
import { GIROS } from "@/lib/validation";
import { Alerta, Check, Documento, Escudo, Lupa, Qr, Tienda } from "../../iconos";
import { BotonImprimir, Guia } from "../../guia";

export default function RegistroComerciante() {
  const [msg, setMsg] = useState<{ texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [recibo, setRecibo] = useState<{ estado: string; ruc: string; dni: string; razonSocial: string; fecha: string } | null>(null);

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
      setRecibo({
        estado: j.estado,
        ruc: String(datos.ruc),
        dni: "••••" + String(datos.dni).slice(-4),
        razonSocial: String(datos.razonSocial),
        fecha: new Date().toLocaleString("es-PE"),
      });
      form.reset();
      window.scrollTo({ top: 0 });
    } else setMsg({ texto: j.error });
  }

  if (recibo)
    return (
      <div className="aparece">
        <div className="recibo">
          <div className="check"><Check size={36} /></div>
          <h1>¡Listo! Recibimos tu solicitud</h1>
          <p className="lead" role="status">Solicitud enviada. Estado: {recibo.estado}. La administración revisará tus datos.</p>
          <div className="datos-recibo">
            <div><span>Negocio</span><b style={{ fontFamily: "var(--sans)" }}>{recibo.razonSocial}</b></div>
            <div><span>Tu RUC</span><b>{recibo.ruc}</b></div>
            <div><span>Tu DNI</span><b>{recibo.dni}</b></div>
            <div><span>Fecha</span><b style={{ fontSize: 15 }}>{recibo.fecha}</b></div>
          </div>
          <Guia
            pasos={[
              <><b>No necesitas hacer nada más por ahora.</b> No te enviaremos correos ni mensajes: tú mismo consultas cómo va tu trámite.</>,
              <><b>Guarda este comprobante.</b> Imprímelo o tómale una foto con tu celular. Lo importante es recordar tu <b>RUC</b> y tu <b>DNI</b>.</>,
              <><b>En unos días, entra a «Mi solicitud»</b> (en el menú de arriba) y escribe tu RUC y tu DNI para ver si ya fue aprobada.</>,
              <><b>Cuando esté aprobada</b> verás tu número de puesto y tu licencia con código QR. Imprímela o muéstrala desde tu celular.</>,
              <><b>¿Tienes dudas o no sabes usar la página?</b> Acércate a la oficina de administración del mercado con tu DNI y este comprobante.</>,
            ]}
          />
          <div className="acciones">
            <Link className="btn grande" href="/comerciantes/estado"><Lupa /> Ver mi solicitud</Link>
            <BotonImprimir />
            <button type="button" className="sec grande" onClick={() => setRecibo(null)}>Registrar otro comerciante</button>
          </div>
        </div>
      </div>
    );

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
          {msg && <div className="err" role="alert"><Alerta /><span>{msg.texto}</span></div>}
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
