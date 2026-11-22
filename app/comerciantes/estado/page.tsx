"use client";
import Link from "next/link";
import { useState } from "react";
import { Alerta, Escudo, Lupa, Qr } from "../../iconos";
import { BotonImprimir, Guia } from "../../guia";

type Resultado = {
  razonSocial: string;
  giro: string;
  estado: "Pendiente" | "Aprobado" | "Rechazado";
  motivoRechazo: string | null;
  puestoId: string | null;
  codigoLicencia: string | null;
  licenciaEstado: string | null;
  licenciaMotivo: string | null;
  creadoEn: string;
};

const ETAPAS = ["Solicitud enviada", "En revisión", "Aprobada", "Puesto y licencia"];

export default function MiSolicitud() {
  const [res, setRes] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  async function consultar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRes(null);
    setError(null);
    setBuscando(true);
    const datos = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch("/api/comerciantes/consulta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos), credentials: "omit" });
    const j = await r.json();
    setBuscando(false);
    if (r.ok) setRes(j);
    else setError(j.error);
  }

  const paso = !res ? -1 : res.estado === "Pendiente" ? 1 : res.puestoId ? 3 : 2;

  return (
    <div className="aparece" style={{ maxWidth: 820, margin: "auto" }}>
      <div className="cabecera no-imprimir" style={{ textAlign: "center" }}>
        <span className="ceja">Para comerciantes</span>
        <h1>Mi solicitud</h1>
        <p className="sub" style={{ marginInline: "auto" }}>Escribe el RUC y el DNI que usaste al registrarte. No necesitas contraseña ni código.</p>
      </div>

      <form className="card no-imprimir" onSubmit={consultar}>
        <div className="grid">
          <div><label htmlFor="ruc">RUC</label><input id="ruc" name="ruc" inputMode="numeric" maxLength={11} placeholder="11 números" style={{ fontSize: 20 }} required /></div>
          <div><label htmlFor="dni">DNI</label><input id="dni" name="dni" inputMode="numeric" maxLength={8} placeholder="8 números" style={{ fontSize: 20 }} required /></div>
        </div>
        <div className="acciones"><button className="grande" disabled={buscando}><Lupa /> {buscando ? "Buscando…" : "Consultar mi solicitud"}</button></div>
        {error && <div className="err" role="alert"><Alerta /><span>{error} Si no recuerdas tus datos, acércate a la oficina de administración del mercado.</span></div>}
      </form>

      {res && (
        <div className="recibo aparece" style={{ marginTop: 24, maxWidth: "none" }}>
          <span className="aviso">Solicitud de <b>{res.razonSocial}</b> · {res.giro} · enviada el {new Date(res.creadoEn).toLocaleDateString("es-PE")}</span>

          {res.estado !== "Rechazado" && (
            <ol className="linea" aria-label="Avance de tu trámite">
              {ETAPAS.map((e, i) => <li key={e} data-paso={e} className={i < paso ? "hecho" : i === paso ? "actual" : ""} aria-current={i === paso ? "step" : undefined}><i /></li>)}
            </ol>
          )}

          {res.estado === "Pendiente" && (
            <>
              <div className="estado-grande Pendiente" role="status">
                <h2>Tu solicitud está en revisión</h2>
                <p>La administración del mercado está revisando tus datos. Todavía no hay una respuesta.</p>
              </div>
              <Guia pasos={[
                <><b>No tienes que hacer nada ahora.</b> Tu solicitud ya está registrada.</>,
                <><b>Te avisaremos por correo</b> cuando haya una respuesta (revisa también la carpeta de spam). Si no te llega, vuelve a consultar aquí en unos días.</>,
                <><b>¿Pasó mucho tiempo?</b> Acércate a la oficina de administración del mercado con tu DNI.</>,
              ]} />
            </>
          )}

          {res.estado === "Aprobado" && !res.puestoId && (res.licenciaEstado ?? "Vigente") === "Vigente" && (
            <>
              <div className="estado-grande Aprobado" role="status">
                <h2>¡Tu solicitud fue aprobada!</h2>
                <p>Solo falta que la administración te asigne un puesto en el mercado.</p>
              </div>
              <Guia pasos={[
                <><b>Espera la asignación de tu puesto.</b> No tienes que llenar nada más.</>,
                <><b>Te avisaremos por correo</b> cuando tengas puesto, con el enlace a tu licencia con QR. También aparecerá aquí.</>,
              ]} />
            </>
          )}

          {res.estado === "Aprobado" && res.licenciaEstado && res.licenciaEstado !== "Vigente" && (
            <>
              <div className="estado-grande Rechazado" role="status">
                <h2>Tu licencia está {res.licenciaEstado === "En revisión" ? "en revisión" : res.licenciaEstado.toLowerCase()}</h2>
                {res.licenciaMotivo && <p><b>Motivo:</b> {res.licenciaMotivo}</p>}
              </div>
              <Guia pasos={[
                res.licenciaEstado === "En revisión" ? <><b>Puedes seguir trabajando</b> mientras dure la revisión.</> : res.licenciaEstado === "Suspendida" ? <><b>No puedes atender en tu puesto</b> mientras dure la suspensión.</> : <><b>Tu puesto fue liberado</b> y la licencia ya no es válida.</>,
                <><b>Acércate a la oficina de administración del mercado</b> con tu DNI para dar tus descargos o regularizar tu situación.</>,
                <><b>¿No estás de acuerdo?</b> Puedes presentar un reclamo en el <Link href="/libro-reclamaciones">Libro de Reclamaciones</Link>.</>,
              ]} />
            </>
          )}

          {res.estado === "Aprobado" && res.puestoId && (res.licenciaEstado ?? "Vigente") === "Vigente" && (
            <>
              <div className="estado-grande Aprobado" role="status">
                <h2>¡Felicidades! Ya eres comerciante formalizado</h2>
                <p>Tu puesto es el <b style={{ fontSize: 24 }}>{res.puestoId}</b>. Tu licencia es la <b className="mono">{res.codigoLicencia}</b>.</p>
              </div>
              <Guia pasos={[
                <><b>Abre tu licencia</b> con el botón verde de abajo.</>,
                <><b>Imprímela y colócala en un lugar visible de tu puesto</b>, o guárdala en tu celular.</>,
                <><b>Si un inspector o cliente escanea el código QR</b>, verá que tu negocio es formal. Nunca verá tu DNI ni tu teléfono.</>,
              ]} />
              {res.codigoLicencia && <div className="acciones"><Link className="btn grande" href={`/licencia/${res.codigoLicencia}`}><Qr /> Ver e imprimir mi licencia</Link></div>}
            </>
          )}

          {res.estado === "Rechazado" && (
            <>
              <div className="estado-grande Rechazado" role="status">
                <h2>Tu solicitud no fue aprobada</h2>
                {res.motivoRechazo && <p><b>Motivo:</b> {res.motivoRechazo}</p>}
              </div>
              <Guia pasos={[
                <><b>Lee el motivo</b> que escribió la administración.</>,
                <><b>Acércate a la oficina de administración del mercado</b> con tu DNI y tu ficha RUC para corregir lo que falte.</>,
              ]} />
            </>
          )}

          <div className="acciones no-imprimir"><BotonImprimir texto="Imprimir esta página" /></div>
        </div>
      )}

      <p className="aviso no-imprimir" style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginTop: 18 }}><Escudo size={16} /> Tus datos están protegidos: nunca mostramos tu correo ni tu teléfono.</p>
    </div>
  );
}
