import { randomUUID } from "node:crypto";
import type { Comerciante, Denuncia, Reclamo, Reporte, EstadoDenuncia, EstadoSolicitud, Puesto, Repositorio } from "./types";

/** Repositorio en memoria: usado por las pruebas automatizadas y por el modo demo sin base de datos. */
export class RepositorioMemoria implements Repositorio {
  comerciantes: Comerciante[] = [];
  denuncias: Denuncia[] = [];
  reclamos: Reclamo[] = [];
  reportes: Reporte[] = [];
  puestos: Puesto[];

  constructor(puestos?: Puesto[]) {
    this.puestos = puestos ?? [
      { id: "A-101", bloque: "A", numero: 101, giro: "Frutas", comercianteId: null },
      { id: "A-102", bloque: "A", numero: 102, giro: "Frutas", comercianteId: null },
      { id: "B-201", bloque: "B", numero: 201, giro: "Verduras", comercianteId: null },
      { id: "C-301", bloque: "C", numero: 301, giro: "Tubérculos", comercianteId: null },
    ];
  }

  async buscarComerciantePorRuc(ruc: string) { return this.comerciantes.find((c) => c.ruc === ruc) ?? null; }
  async buscarComerciantePorId(id: string) { return this.comerciantes.find((c) => c.id === id) ?? null; }
  async buscarComerciantePorLicencia(codigo: string) { return this.comerciantes.find((c) => c.codigoLicencia === codigo) ?? null; }
  async crearComerciante(c: Omit<Comerciante, "id" | "creadoEn">) {
    const nuevo = { ...c, id: randomUUID(), creadoEn: new Date().toISOString() };
    this.comerciantes.push(nuevo);
    return nuevo;
  }
  async actualizarComerciante(id: string, cambios: Partial<Comerciante>) {
    const i = this.comerciantes.findIndex((c) => c.id === id);
    this.comerciantes[i] = { ...this.comerciantes[i], ...cambios };
    return this.comerciantes[i];
  }
  async listarComerciantes(estado?: EstadoSolicitud) {
    return this.comerciantes.filter((c) => !estado || c.estado === estado);
  }
  async listarPuestos() { return this.puestos; }
  async buscarPuesto(id: string) { return this.puestos.find((p) => p.id === id) ?? null; }
  async ocuparPuesto(puestoId: string, comercianteId: string) {
    const p = this.puestos.find((x) => x.id === puestoId);
    if (!p || p.comercianteId) return false;
    p.comercianteId = comercianteId;
    return true;
  }
  async crearDenuncia(d: Omit<Denuncia, "id" | "creadoEn" | "actualizadoEn">) {
    const ahora = new Date().toISOString();
    const nueva = { ...d, id: randomUUID(), creadoEn: ahora, actualizadoEn: ahora };
    this.denuncias.push(nueva);
    return nueva;
  }
  async buscarDenunciaPorCodigo(codigo: string) { return this.denuncias.find((d) => d.codigo === codigo) ?? null; }
  async liberarPuesto(puestoId: string) {
    const p = this.puestos.find((x) => x.id === puestoId);
    if (p) p.comercianteId = null;
  }
  async crearReporte(r: Omit<Reporte, "id" | "creadoEn" | "estado">) {
    const nuevo: Reporte = { ...r, id: randomUUID(), estado: "Nuevo", creadoEn: new Date().toISOString() };
    this.reportes.push(nuevo);
    return nuevo;
  }
  async listarReportes() { return [...this.reportes].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)); }
  async buscarReporte(id: string) { return this.reportes.find((r) => r.id === id) ?? null; }
  async marcarReporteAtendido(id: string) {
    const r = this.reportes.find((x) => x.id === id);
    if (r) r.estado = "Atendido";
  }
  async crearReclamo(r: Omit<Reclamo, "id" | "creadoEn">) {
    const nuevo: Reclamo = { ...r, id: randomUUID(), creadoEn: new Date().toISOString(), estado: "Recibido", respuesta: null, respondidoEn: null };
    this.reclamos.push(nuevo);
    return nuevo;
  }
  async listarReclamos() { return [...this.reclamos].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)); }
  async buscarReclamo(id: string) { return this.reclamos.find((r) => r.id === id) ?? null; }
  async responderReclamo(id: string, respuesta: string) {
    const r = this.reclamos.find((x) => x.id === id && x.estado !== "Respondido");
    if (!r) return null;
    Object.assign(r, { estado: "Respondido", respuesta, respondidoEn: new Date().toISOString() });
    return r;
  }
  async listarDenuncias() { return [...this.denuncias].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)); }
  async actualizarEstadoDenuncia(codigo: string, anterior: EstadoDenuncia, nuevo: EstadoDenuncia) {
    const d = this.denuncias.find((x) => x.codigo === codigo && x.estado === anterior);
    if (!d) return null;
    d.estado = nuevo;
    d.actualizadoEn = new Date().toISOString();
    return d;
  }
}
