"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Comerciante, Puesto } from "@/lib/types";

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
    if (r.ok) void cargar();
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

  if (autenticado === null) return <p>Cargando…</p>;
  if (!autenticado)
    return (
      <form className="card" onSubmit={login} style={{ maxWidth: 380 }}>
        <h1>Administración</h1>
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required />
        <p><button>Ingresar</button></p>
        {msg && <div className="err">{msg.texto}</div>}
      </form>
    );

  const libres = puestos.filter((p) => !p.comercianteId);
  return (
    <>
      <h1>Solicitudes de comerciantes</h1>
      <p className="sub">HU02 aprobar/rechazar · HU03 asignar puesto · HU04 licencia con QR</p>
      {msg && <div className={msg.ok ? "ok" : "err"}>{msg.texto}</div>}
      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead><tr><th>Comerciante</th><th>RUC</th><th>Giro</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={5}>Sin solicitudes todavía.</td></tr>}
            {lista.map((c) => (
              <tr key={c.id}>
                <td>{c.razonSocial}<br /><span className="aviso">{c.nombres}</span></td>
                <td>{c.ruc}</td>
                <td>{c.giro}</td>
                <td><span className={`tag ${c.estado}`}>{c.estado}</span>{c.motivoRechazo && <div className="aviso">{c.motivoRechazo}</div>}</td>
                <td>
                  {c.estado === "Pendiente" && (
                    <>
                      <button onClick={() => accion(`/api/comerciantes/${c.id}/decision`, { decision: "aprobar" }, "Solicitud aprobada y licencia generada")}>Aprobar</button>{" "}
                      <button className="peligro" onClick={() => rechazar(c.id)}>Rechazar</button>
                    </>
                  )}
                  {c.estado === "Aprobado" && !c.puestoId && (
                    <select defaultValue="" onChange={(e) => e.target.value && accion(`/api/comerciantes/${c.id}/puesto`, { puestoId: e.target.value }, "Puesto asignado")}>
                      <option value="" disabled>Asignar puesto…</option>
                      {libres.map((p) => <option key={p.id} value={p.id}>{p.id} ({p.giro})</option>)}
                    </select>
                  )}
                  {c.puestoId && <div>Puesto {c.puestoId}</div>}
                  {c.codigoLicencia && <Link href={`/licencia/${c.codigoLicencia}`}>Ver licencia {c.codigoLicencia}</Link>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="sec" onClick={() => fetch("/api/admin/logout", { method: "POST" }).then(() => setAutenticado(false))}>Cerrar sesión</button>
    </>
  );
}
