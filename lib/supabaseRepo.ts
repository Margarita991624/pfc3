import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Comerciante, Denuncia, EstadoSolicitud, Puesto, Repositorio } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const aComerciante = (r: any): Comerciante => ({
  id: r.id, nombres: r.nombres, dni: r.dni, ruc: r.ruc, razonSocial: r.razon_social, giro: r.giro,
  email: r.email, telefono: r.telefono, estado: r.estado, motivoRechazo: r.motivo_rechazo,
  codigoLicencia: r.codigo_licencia, puestoId: r.puesto_id, creadoEn: r.creado_en,
});
const aPuesto = (r: any): Puesto => ({ id: r.id, bloque: r.bloque, numero: r.numero, giro: r.giro, comercianteId: r.comerciante_id });
const aDenuncia = (r: any): Denuncia => ({
  id: r.id, codigo: r.codigo, categoria: r.categoria, ubicacion: r.ubicacion, descripcion: r.descripcion,
  estado: r.estado, creadoEn: r.creado_en, actualizadoEn: r.actualizado_en,
});
const aFila = (c: Partial<Comerciante>) => {
  const m: Record<string, unknown> = {};
  const mapa: Record<string, string> = { razonSocial: "razon_social", motivoRechazo: "motivo_rechazo", codigoLicencia: "codigo_licencia", puestoId: "puesto_id" };
  for (const [k, v] of Object.entries(c)) if (k !== "id" && k !== "creadoEn") m[mapa[k] ?? k] = v;
  return m;
};

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(`Error de base de datos: ${res.error.message}`);
  return res.data;
}

/**
 * Repositorio sobre Supabase (PostgreSQL). Usa la service_role key SOLO en el servidor
 * (variable de entorno de Vercel, nunca expuesta al navegador). Las tablas tienen RLS activado
 * sin políticas para anon, por lo que el acceso directo desde el cliente está bloqueado.
 */
export class RepositorioSupabase implements Repositorio {
  private db: SupabaseClient;
  constructor(url: string, serviceKey: string) {
    this.db = createClient(url, serviceKey, { auth: { persistSession: false } });
  }
  async buscarComerciantePorRuc(ruc: string) {
    const d = check(await this.db.from("comerciantes").select("*").eq("ruc", ruc).maybeSingle());
    return d ? aComerciante(d) : null;
  }
  async buscarComerciantePorId(id: string) {
    const d = check(await this.db.from("comerciantes").select("*").eq("id", id).maybeSingle());
    return d ? aComerciante(d) : null;
  }
  async buscarComerciantePorLicencia(codigo: string) {
    const d = check(await this.db.from("comerciantes").select("*").eq("codigo_licencia", codigo).maybeSingle());
    return d ? aComerciante(d) : null;
  }
  async crearComerciante(c: Omit<Comerciante, "id" | "creadoEn">) {
    return aComerciante(check(await this.db.from("comerciantes").insert(aFila(c)).select().single()));
  }
  async actualizarComerciante(id: string, cambios: Partial<Comerciante>) {
    return aComerciante(check(await this.db.from("comerciantes").update(aFila(cambios)).eq("id", id).select().single()));
  }
  async listarComerciantes(estado?: EstadoSolicitud) {
    let q = this.db.from("comerciantes").select("*").order("creado_en", { ascending: false });
    if (estado) q = q.eq("estado", estado);
    return (check(await q) ?? []).map(aComerciante);
  }
  async listarPuestos() {
    return (check(await this.db.from("puestos").select("*").order("id")) ?? []).map(aPuesto);
  }
  async buscarPuesto(id: string) {
    const d = check(await this.db.from("puestos").select("*").eq("id", id).maybeSingle());
    return d ? aPuesto(d) : null;
  }
  async ocuparPuesto(puestoId: string, comercianteId: string) {
    // Actualización condicional: evita que dos administradores asignen el mismo puesto a la vez.
    const d = check(await this.db.from("puestos").update({ comerciante_id: comercianteId }).eq("id", puestoId).is("comerciante_id", null).select());
    return (d ?? []).length === 1;
  }
  async crearDenuncia(d: Omit<Denuncia, "id" | "creadoEn" | "actualizadoEn">) {
    return aDenuncia(check(await this.db.from("denuncias").insert(d).select().single()));
  }
  async buscarDenunciaPorCodigo(codigo: string) {
    const d = check(await this.db.from("denuncias").select("*").eq("codigo", codigo).maybeSingle());
    return d ? aDenuncia(d) : null;
  }
}
