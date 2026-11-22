"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Comerciante, Puesto } from "@/lib/types";
import { Alerta, Candado, Check, Qr } from "../iconos";

const iniciales = (t: string) => t.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

export default function Admin() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [lista, setLista] = useState<Comerciante[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);

  const cargar = useCallback(async () => {
    const r = await fetch("/api/comerciantes");
    if (r.status === 401) return setAutenticado(false);
    setAutenticado(true);
    setLista(await r.json());
    const p = await fetch("/api/puestos");
    if (p.ok) setPuestos(await p.json());
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

  const libres = puestos.filter((p) => !p.comercianteId);
  const pendientes = lista.filter((c) => c.estado === "Pendiente").length;
  const aprobados = lista.filter((c) => c.estado === "Aprobado").length;
  const rechazados = lista.filter((c) => c.estado === "Rechazado").length;

  return (
    <div className="aparece">
      <div className="barra">
        <div>
          <span className="ceja">Panel municipal <span className="chip">HU02 · HU03 · HU04</span></span>
          <h1>Solicitudes de comerciantes</h1>
        </div>
        <button className="sec" onClick={() => fetch("/api/admin/logout", { method: "POST" }).then(() => setAutenticado(false))}>Cerrar sesión</button>
      </div>

      <div className="kpis">
        <div className="kpi"><span>Solicitudes</span><b>{lista.length}</b></div>
        <div className="kpi m"><span>Por revisar</span><b>{pendientes}</b></div>
        <div className="kpi v"><span>Formalizados</span><b>{aprobados}</b></div>
        <div className="kpi t"><span>Puestos libres</span><b>{libres.length}</b><small className="aviso">{rechazados} rechazadas</small></div>
      </div>

      {msg && <div className={msg.ok ? "ok" : "err"} role="status" style={{ marginBottom: 18 }}>{msg.ok ? <Check /> : <Alerta />}<span>{msg.texto}</span></div>}

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
    </div>
  );
}
