"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Comerciante, Denuncia, EstadoDenuncia, Puesto } from "@/lib/types";
import { Alerta, Candado, Check, Megafono, Qr, Tienda } from "../iconos";

// HU16: acciones permitidas según el estado actual (el backend vuelve a validar el flujo).
const ACCIONES: Record<EstadoDenuncia, { estado: EstadoDenuncia; texto: string; clase?: string }[]> = {
  Recibida: [{ estado: "En revisión", texto: "Iniciar revisión" }],
  "En revisión": [{ estado: "Derivada", texto: "Derivar a PNP / Fiscalía", clase: "peligro" }, { estado: "Cerrada", texto: "Cerrar", clase: "sec" }],
  Derivada: [{ estado: "Cerrada", texto: "Cerrar caso", clase: "sec" }],
  Cerrada: [],
};

const iniciales = (t: string) => t.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

export default function Admin() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [lista, setLista] = useState<Comerciante[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [vista, setVista] = useState<"comerciantes" | "denuncias">("comerciantes");

  const cargar = useCallback(async () => {
    const r = await fetch("/api/comerciantes");
    if (r.status === 401) return setAutenticado(false);
    setAutenticado(true);
    setLista(await r.json());
    const p = await fetch("/api/puestos");
    if (p.ok) setPuestos(await p.json());
    const d = await fetch("/api/denuncias");
    if (d.ok) setDenuncias(await d.json());
  }, []);

  // Carga inicial de datos desde la API (sincronización con un sistema externo).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void cargar(); }, [cargar]);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (r.ok) { setMsg(null); void cargar(); }
    else setMsg({ ok: false, texto: "Contraseña incorrecta" });
  }

  async function accion(url: string, body: object, ok: string) {
    setMsg(null);
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    setMsg(r.ok ? { ok: true, texto: ok } : { ok: false, texto: j.error });
    void cargar();
  }

  function rechazar(id: string) {
    const motivo = window.prompt("Motivo del rechazo (obligatorio):") ?? "";
    void accion(`/api/comerciantes/${id}/decision`, { decision: "rechazar", motivo }, "Solicitud rechazada");
  }

  if (autenticado === null) return <p className="cargando">Cargando…</p>;
  if (!autenticado)
    return (
      <form className="card acceso aparece" onSubmit={login}>
        <div className="candado"><Candado size={26} /></div>
        <span className="ceja">Acceso restringido</span>
        <h1>Administración</h1>
        <p className="aviso" style={{ marginTop: 8 }}>Sesión firmada (HMAC) en cookie httpOnly. Solo personal municipal autorizado.</p>
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
        <div className="acciones"><button style={{ width: "100%" }}>Ingresar</button></div>
        {msg && <div className="err" role="alert"><Alerta /><span>{msg.texto}</span></div>}
      </form>
    );

  async function moverDenuncia(codigo: string, estado: EstadoDenuncia) {
    await accion(`/api/denuncias/${encodeURIComponent(codigo)}/estado`, { estado }, `Denuncia ${codigo}: ${estado}`);
  }

  const libres = puestos.filter((p) => !p.comercianteId);
  const pendientes = lista.filter((c) => c.estado === "Pendiente").length;
  const aprobados = lista.filter((c) => c.estado === "Aprobado").length;
  const rechazados = lista.filter((c) => c.estado === "Rechazado").length;
  const cuenta = (e: EstadoDenuncia) => denuncias.filter((d) => d.estado === e).length;
  const porAtender = cuenta("Recibida") + cuenta("En revisión");

  return (
    <div className="aparece">
      <div className="barra">
        <div>
          <span className="ceja">Panel municipal <span className="chip">{vista === "comerciantes" ? "HU02 · HU03 · HU04" : "HU16"}</span></span>
          <h1>{vista === "comerciantes" ? "Solicitudes de comerciantes" : "Bandeja de denuncias"}</h1>
        </div>
        <button className="sec" onClick={() => fetch("/api/admin/logout", { method: "POST" }).then(() => setAutenticado(false))}>Cerrar sesión</button>
      </div>

      <div className="pestanas" role="tablist" aria-label="Secciones del panel">
        <button role="tab" aria-selected={vista === "comerciantes"} className={vista === "comerciantes" ? "activa" : ""} onClick={() => { setVista("comerciantes"); setMsg(null); }}>
          <Tienda /> Comerciantes <span className="cuenta">{pendientes}</span>
        </button>
        <button role="tab" aria-selected={vista === "denuncias"} className={vista === "denuncias" ? "activa" : ""} onClick={() => { setVista("denuncias"); setMsg(null); }}>
          <Megafono /> Denuncias <span className="cuenta">{porAtender}</span>
        </button>
      </div>

      {msg && <div className={msg.ok ? "ok" : "err"} role="status" style={{ marginBottom: 18 }}>{msg.ok ? <Check /> : <Alerta />}<span>{msg.texto}</span></div>}

      {vista === "denuncias" ? (
        <>
          <div className="kpis">
            <div className="kpi"><span>Total</span><b>{denuncias.length}</b></div>
            <div className="kpi m"><span>Nuevas</span><b>{cuenta("Recibida")}</b></div>
            <div className="kpi t"><span>Derivadas</span><b>{cuenta("Derivada")}</b></div>
            <div className="kpi v"><span>Cerradas</span><b>{cuenta("Cerrada")}</b><small className="aviso">{cuenta("En revisión")} en revisión</small></div>
          </div>
          <div className="card" style={{ padding: 0, overflowX: "auto" }}>
            <table>
              <thead><tr><th>Código</th><th>Categoría</th><th>Ubicación y relato</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {denuncias.length === 0 && <tr><td colSpan={5} className="vacio">No hay denuncias registradas.</td></tr>}
                {denuncias.map((d) => (
                  <tr key={d.codigo}>
                    <td><span className="mono"><b>{d.codigo}</b></span><br /><span className="aviso">{new Date(d.creadoEn).toLocaleString("es-PE")}</span></td>
                    <td>{d.categoria}</td>
                    <td style={{ maxWidth: 360 }}>
                      <b>{d.ubicacion}</b>
                      <details className="relato"><summary>Ver relato</summary><p>{d.descripcion}</p></details>
                    </td>
                    <td><span className={`tag ${d.estado.replace(/\s/g, "")}`}>{d.estado}</span></td>
                    <td>
                      <div className="ops">
                        {ACCIONES[d.estado].map((a) => (
                          <button key={a.estado} className={`chico ${a.clase ?? ""}`} onClick={() => moverDenuncia(d.codigo, a.estado)}>{a.texto}</button>
                        ))}
                        {d.estado === "Cerrada" && <span className="aviso">Caso cerrado</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="aviso" style={{ marginTop: 14 }}>La bandeja no muestra datos del denunciante porque el sistema nunca los guarda (sin nombre, DNI, IP ni dispositivo).</p>
        </>
      ) : (
      <>
      <div className="kpis">
        <div className="kpi"><span>Solicitudes</span><b>{lista.length}</b></div>
        <div className="kpi m"><span>Por revisar</span><b>{pendientes}</b></div>
        <div className="kpi v"><span>Formalizados</span><b>{aprobados}</b></div>
        <div className="kpi t"><span>Puestos libres</span><b>{libres.length}</b><small className="aviso">{rechazados} rechazadas</small></div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table>
          <thead><tr><th>Comerciante</th><th>RUC</th><th>Giro</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={5} className="vacio">Sin solicitudes todavía. Cuando un comerciante se registre, aparecerá aquí.</td></tr>}
            {lista.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="quien">
                    <span className="avatar" aria-hidden>{iniciales(c.razonSocial)}</span>
                    <span><b>{c.razonSocial}</b><br /><span className="aviso">{c.nombres}</span></span>
                  </div>
                </td>
                <td className="mono">{c.ruc}</td>
                <td>{c.giro}</td>
                <td><span className={`tag ${c.estado}`}>{c.estado}</span>{c.motivoRechazo && <div className="aviso" style={{ marginTop: 6 }}>{c.motivoRechazo}</div>}</td>
                <td>
                  <div className="ops">
                    {c.estado === "Pendiente" && (
                      <>
                        <button className="chico" onClick={() => accion(`/api/comerciantes/${c.id}/decision`, { decision: "aprobar" }, "Solicitud aprobada y licencia generada")}>Aprobar</button>
                        <button className="chico peligro" onClick={() => rechazar(c.id)}>Rechazar</button>
                      </>
                    )}
                    {c.estado === "Aprobado" && !c.puestoId && (
                      <select defaultValue="" onChange={(e) => e.target.value && accion(`/api/comerciantes/${c.id}/puesto`, { puestoId: e.target.value }, "Puesto asignado")}>
                        <option value="" disabled>Asignar puesto…</option>
                        {libres.map((p) => <option key={p.id} value={p.id}>{p.id} ({p.giro})</option>)}
                      </select>
                    )}
                    {c.puestoId && <span className="tag Aprobado">Puesto {c.puestoId}</span>}
                    {c.codigoLicencia && <Link href={`/licencia/${c.codigoLicencia}`} style={{ display: "inline-flex", gap: 6, alignItems: "center", fontWeight: 600 }}><Qr size={16} />Ver licencia {c.codigoLicencia}</Link>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  );
}
