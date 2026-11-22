"use client";
import Link from "next/link";
import { useState } from "react";
import { CONTACTO_EMAIL } from "@/lib/contacto";
import { Alerta, Check, Libro } from "../iconos";
import { BotonImprimir, Guia } from "../guia";

type Hoja = { codigo: string; tipo: string; creadoEn: string };

export default function LibroReclamaciones() {
  const [hoja, setHoja] = useState<Hoja | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [email, setEmail] = useState("");

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const f = new FormData(e.currentTarget);
    const datos = { ...Object.fromEntries(f), acepta: f.get("acepta") === "on" };
    setEmail(String(f.get("email") ?? ""));
    const r = await fetch("/api/reclamos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
    const j = await r.json();
    setEnviando(false);
    if (r.ok) { setHoja(j); window.scrollTo({ top: 0 }); }
    else setError(j.error);
  }

  if (hoja)
    return (
      <div className="recibo aparece">
        <div className="check"><Check size={36} /></div>
        <h1>Registramos tu hoja de reclamación</h1>
        <p className="lead" role="status">Tu {hoja.tipo.toLowerCase()} quedó registrado con el número:</p>
        <div className="boleto" style={{ boxShadow: "none", padding: 20, marginTop: 16 }}>
          <p className="codigo" style={{ margin: 0 }}>{hoja.codigo}</p>
          <p className="aviso" style={{ margin: "6px 0 0" }}>Fecha: {new Date(hoja.creadoEn).toLocaleString("es-PE")}</p>
        </div>
        <Guia pasos={[
          <><b>Guarda este número.</b> Imprime esta página o tómale una foto.</>,
          <><b>Te enviamos una copia</b> a <b>{email}</b>. Si no la ves, revisa la carpeta de spam.</>,
          <><b>Te responderemos por correo</b> en un plazo máximo de <b>15 días hábiles</b>.</>,
          <><b>¿Tienes algo más que agregar?</b> Escríbenos a <a href={`mailto:${CONTACTO_EMAIL}?subject=${encodeURIComponent(`Hoja ${hoja.codigo}`)}`}>{CONTACTO_EMAIL}</a> indicando tu número de hoja.</>,
        ]} />
        <div className="acciones"><BotonImprimir texto="Imprimir constancia" /><Link className="btn claro grande" href="/">Volver al inicio</Link></div>
      </div>
    );

  return (
    <div className="aparece" style={{ maxWidth: 860, margin: "auto" }}>
      <div className="cabecera">
        <span className="ceja">Atención al usuario</span>
        <h1 style={{ display: "flex", gap: 12, alignItems: "center" }}><Libro size={36} /> Libro de Reclamaciones</h1>
        <p className="sub">Conforme a lo establecido en el Código de Protección y Defensa del Consumidor, esta plataforma cuenta con un Libro de Reclamaciones virtual a tu disposición.</p>
      </div>

      <form className="card" onSubmit={enviar}>
        <fieldset>
          <legend>1. Tus datos</legend>
          <div className="grid">
            <div><label htmlFor="nombres">Nombre completo</label><input id="nombres" name="nombres" autoComplete="name" required /></div>
            <div><label htmlFor="documento">DNI o carné de extranjería</label><input id="documento" name="documento" maxLength={12} required /></div>
            <div style={{ gridColumn: "1 / -1" }}><label htmlFor="domicilio">Domicilio</label><input id="domicilio" name="domicilio" autoComplete="street-address" required /></div>
            <div><label htmlFor="email">Correo electrónico (aquí te responderemos)</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
            <div><label htmlFor="telefono">Teléfono (opcional)</label><input id="telefono" name="telefono" inputMode="tel" maxLength={15} /></div>
            <div style={{ gridColumn: "1 / -1" }}><label htmlFor="apoderado">Si eres menor de edad: nombre de tu padre, madre o apoderado (opcional)</label><input id="apoderado" name="apoderado" /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>2. ¿Sobre qué es?</legend>
          <div className="radio-grupo" style={{ marginTop: 10 }}>
            <label><input type="radio" name="bienTipo" value="Servicio" defaultChecked /> Servicio</label>
            <label><input type="radio" name="bienTipo" value="Producto" /> Producto</label>
          </div>
          <div className="grid">
            <div style={{ gridColumn: "1 / -1" }}><label htmlFor="descripcionBien">Descripción del producto o servicio</label><input id="descripcionBien" name="descripcionBien" placeholder="Ej.: atención de mi solicitud de licencia" required /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>3. Detalle</legend>
          <div className="radio-grupo" style={{ marginTop: 10 }}>
            <label><input type="radio" name="tipo" value="Reclamo" defaultChecked /> <span><b>Reclamo:</b> no estoy conforme con el producto o servicio recibido.</span></label>
            <label><input type="radio" name="tipo" value="Queja" /> <span><b>Queja:</b> no estoy conforme con la atención recibida (no relacionada con el producto o servicio).</span></label>
          </div>
          <label htmlFor="detalle">¿Qué pasó?</label>
          <textarea id="detalle" name="detalle" required />
          <label htmlFor="pedido">¿Qué solución pides?</label>
          <textarea id="pedido" name="pedido" style={{ minHeight: 90 }} required />
        </fieldset>

        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontWeight: 500, marginTop: 22 }}>
          <input type="checkbox" name="acepta" style={{ width: "auto", marginTop: 5 }} required />
          <span>Declaro que los datos son verdaderos y acepto los <Link href="/terminos">términos y condiciones</Link>.</span>
        </label>

        <p className="aviso" style={{ marginTop: 16 }}>
          La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.
          El proveedor deberá dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles improrrogables.
        </p>

        <div className="acciones"><button className="grande" disabled={enviando}>{enviando ? "Enviando…" : "Enviar hoja de reclamación"}</button></div>
        {error && <div className="err" role="alert"><Alerta /><span>{error}</span></div>}
      </form>
    </div>
  );
}
