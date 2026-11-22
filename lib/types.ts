export type EstadoSolicitud = "Pendiente" | "Aprobado" | "Rechazado";

export interface Comerciante {
  id: string;
  nombres: string;
  dni: string;
  ruc: string;
  razonSocial: string;
  giro: string;
  email: string;
  telefono: string;
  estado: EstadoSolicitud;
  motivoRechazo: string | null;
  codigoLicencia: string | null;
  puestoId: string | null;
  /** MORD-36: estado de la licencia emitida (por defecto Vigente). */
  licenciaEstado?: EstadoLicencia;
  licenciaMotivo?: string | null;
  creadoEn: string;
}

export type EstadoLicencia = "Vigente" | "En revisión" | "Suspendida" | "Revocada";

/** MORD-36: reporte ciudadano de una falta o anomalía en un comercio formalizado. */
export interface Reporte {
  id: string;
  codigo: string;
  codigoLicencia: string;
  categoria: string;
  descripcion: string;
  estado: "Nuevo" | "Atendido";
  creadoEn: string;
}

export interface Puesto {
  id: string;
  bloque: string;
  numero: number;
  giro: string;
  comercianteId: string | null;
}

export type EstadoDenuncia = "Recibida" | "En revisión" | "Derivada" | "Cerrada";

export interface Denuncia {
  id: string;
  codigo: string;
  categoria: string;
  ubicacion: string;
  descripcion: string;
  estado: EstadoDenuncia;
  creadoEn: string;
  actualizadoEn: string;
}

/** MORD-35: hoja del Libro de Reclamaciones (Ley 29571 y su reglamento). */
export interface Reclamo {
  id: string;
  codigo: string;
  tipo: "Reclamo" | "Queja";
  nombres: string;
  documento: string;
  domicilio: string;
  email: string;
  telefono: string | null;
  apoderado: string | null;
  bienTipo: "Producto" | "Servicio";
  monto: number | null;
  descripcionBien: string;
  detalle: string;
  pedido: string;
  creadoEn: string;
}

/** Puerto de persistencia: Supabase en producción, memoria en las pruebas. */
export interface Repositorio {
  buscarComerciantePorRuc(ruc: string): Promise<Comerciante | null>;
  buscarComerciantePorId(id: string): Promise<Comerciante | null>;
  buscarComerciantePorLicencia(codigo: string): Promise<Comerciante | null>;
  crearComerciante(c: Omit<Comerciante, "id" | "creadoEn">): Promise<Comerciante>;
  actualizarComerciante(id: string, cambios: Partial<Comerciante>): Promise<Comerciante>;
  listarComerciantes(estado?: EstadoSolicitud): Promise<Comerciante[]>;
  listarPuestos(): Promise<Puesto[]>;
  buscarPuesto(id: string): Promise<Puesto | null>;
  ocuparPuesto(puestoId: string, comercianteId: string): Promise<boolean>;
  crearDenuncia(d: Omit<Denuncia, "id" | "creadoEn" | "actualizadoEn">): Promise<Denuncia>;
  buscarDenunciaPorCodigo(codigo: string): Promise<Denuncia | null>;
  listarDenuncias(): Promise<Denuncia[]>;
  crearReclamo(r: Omit<Reclamo, "id" | "creadoEn">): Promise<Reclamo>;
  liberarPuesto(puestoId: string): Promise<void>;
  crearReporte(r: Omit<Reporte, "id" | "creadoEn" | "estado">): Promise<Reporte>;
  listarReportes(): Promise<Reporte[]>;
  buscarReporte(id: string): Promise<Reporte | null>;
  marcarReporteAtendido(id: string): Promise<void>;
  actualizarEstadoDenuncia(codigo: string, anterior: EstadoDenuncia, nuevo: EstadoDenuncia): Promise<Denuncia | null>;
}
