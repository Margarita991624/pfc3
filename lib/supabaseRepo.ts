import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Comerciante, Denuncia, Reclamo, EstadoDenuncia, EstadoSolicitud, Puesto, Repositorio } from "./types";

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
/**
 * Mapeo explícito camelCase → columnas. Solo se copian campos conocidos (lista blanca):
 * corrige el hallazgo de CodeQL "Remote property injection" (js/remote-property-injection).
 */
const aFila = (c: Partial<Comerciante>) => {
  const fila: Record<string, unknown> = {};
  if (c.nombres !== undefined) fila.nombres = c.nombres;
  if (c.dni !== undefined) fila.dni = c.dni;
  if (c.ruc !== undefined) fila.ruc = c.ruc;
  if (c.razonSocial !== undefined) fila.razon_social = c.razonSocial;
  if (c.giro !== undefined) fila.giro = c.giro;
  if (c.email !== undefined) fila.email = c.email;
  if (c.telefono !== undefined) fila.telefono = c.telefono;
  if (c.estado !== undefined) fila.estado = c.estado;
  if (c.motivoRechazo !== undefined) fila.motivo_rechazo = c.motivoRechazo;
  if (c.codigoLicencia !== undefined) fila.codigo_licencia = c.codigoLicencia;
  if (c.puestoId !== undefined) fila.puesto_id = c.puestoId;
  return fila;
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
  }  async crearReclamo(r: Omit<Reclamo, "id" | "creadoEn">) {
    // Mapeo explícito (lista blanca) camelCase → columnas.
    const fila = {
      codigo: r.codigo, tipo: r.tipo, nombres: r.nombres, documento: r.documento, domicilio: r.domicilio,
      email: r.email, telefono: r.telefono, apoderado: r.apoderado, bien_tipo: r.bienTipo, monto: r.monto,
      descripcion_bien: r.descripcionBien, detalle: r.detalle, pedido: r.pedido,
    };
    const d = check(await this.db.from("reclamos").insert(fila).select("id, creado_en").single());
    return { ...r, id: d!.id, creadoEn: d!.creado_en };
  }
  async listarDenuncias() {
    const filas = check(await this.db.from("denuncias").select("*").order("creado_en", { ascending: false }).limit(500));
    return (filas ?? []).map(aDenuncia);
  }
  /** Actualización condicional (estado anterior) para evitar carreras entre dos administradores. */
  async actualizarEstadoDenuncia(codigo: string, anterior: EstadoDenuncia, nuevo: EstadoDenuncia) {
    const d = check(
      await this.db.from("denuncias").update({ estado: nuevo, actualizado_en: new Date().toISOString() })
        .eq("codigo", codigo).eq("estado", anterior).select().maybeSingle(),
    );
    return d ? aDenuncia(d) : null;
  }

}
