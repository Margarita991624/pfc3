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
}
