import { ErrorDominio } from "./errors";
import { generarCodigoLicencia, generarCodigoSeguimiento } from "./tracking";
import type { Comerciante, Denuncia, EstadoDenuncia, Repositorio } from "./types";
import {
  asignacionPuestoSchema,
  codigoSeguimientoSchema,
  decisionSchema,
  cambioEstadoDenunciaSchema,
  consultaSolicitudSchema,
  denunciaSchema,
  registroComercianteSchema,
} from "./validation";
import { z } from "zod";

function primerError(e: z.ZodError): string {
  return e.issues[0]?.message ?? "Datos inválidos";
}

/** HU01 (MORD-10): registro de comerciante en estado Pendiente; RUC único. */
export async function registrarComerciante(repo: Repositorio, input: unknown): Promise<Comerciante> {
  const parsed = registroComercianteSchema.safeParse(input);
  if (!parsed.success) throw new ErrorDominio(primerError(parsed.error), 422);
  const datos = parsed.data;
  if (await repo.buscarComerciantePorRuc(datos.ruc)) {
    throw new ErrorDominio("RUC ya registrado", 409);
  }
  return repo.crearComerciante({
    ...datos,
    estado: "Pendiente",
    motivoRechazo: null,
    codigoLicencia: null,
    puestoId: null,
  });
}

/** HU02 (MORD-11): aprobar genera licencia; rechazar exige motivo. */
export async function decidirSolicitud(repo: Repositorio, id: string, input: unknown): Promise<Comerciante> {
  const parsed = decisionSchema.safeParse(input);
  if (!parsed.success) throw new ErrorDominio(primerError(parsed.error), 422);
  const comerciante = await repo.buscarComerciantePorId(id);
  if (!comerciante) throw new ErrorDominio("Solicitud no encontrada", 404);
  if (comerciante.estado !== "Pendiente") throw new ErrorDominio("La solicitud ya fue resuelta", 409);

  if (parsed.data.decision === "aprobar") {
    return repo.actualizarComerciante(id, { estado: "Aprobado", codigoLicencia: generarCodigoLicencia() });
  }
  return repo.actualizarComerciante(id, { estado: "Rechazado", motivoRechazo: parsed.data.motivo });
}

/** HU03 (MORD-12): solo a comerciantes aprobados y solo puestos libres. */
export async function asignarPuesto(repo: Repositorio, comercianteId: string, input: unknown): Promise<Comerciante> {
  const parsed = asignacionPuestoSchema.safeParse(input);
  if (!parsed.success) throw new ErrorDominio(primerError(parsed.error), 422);
  const comerciante = await repo.buscarComerciantePorId(comercianteId);
  if (!comerciante) throw new ErrorDominio("Comerciante no encontrado", 404);
  if (comerciante.estado !== "Aprobado") throw new ErrorDominio("Solo se asignan puestos a comerciantes aprobados", 409);
  if (comerciante.puestoId) throw new ErrorDominio("El comerciante ya tiene un puesto asignado", 409);
  const puesto = await repo.buscarPuesto(parsed.data.puestoId);
  if (!puesto) throw new ErrorDominio("Puesto no encontrado", 404);
  if (puesto.comercianteId) throw new ErrorDominio("Puesto no disponible", 409);
  const ok = await repo.ocuparPuesto(puesto.id, comercianteId);
  if (!ok) throw new ErrorDominio("Puesto no disponible", 409);
  return repo.actualizarComerciante(comercianteId, { puestoId: puesto.id });
}

/** HU04 (MORD-13): verificación pública de licencia (solo datos no sensibles). */
export async function verificarLicencia(repo: Repositorio, codigo: string) {
  const c = await repo.buscarComerciantePorLicencia(codigo.trim().toUpperCase());
  if (!c) throw new ErrorDominio("Licencia no encontrada", 404);
  const puesto = c.puestoId ? await repo.buscarPuesto(c.puestoId) : null;
  return {
    razonSocial: c.razonSocial,
    ruc: c.ruc,
    giro: c.giro,
    puesto: puesto ? `Bloque ${puesto.bloque} - N.º ${puesto.numero}` : "Sin puesto asignado",
    vigente: c.estado === "Aprobado",
    codigoLicencia: c.codigoLicencia,
  };
}

/**
 * HU15 (MORD-24): denuncia anónima. Solo se guardan categoría, ubicación y descripción:
 * ni IP, ni user-agent, ni identidad. El código de seguimiento es aleatorio.
 */
export async function registrarDenuncia(repo: Repositorio, input: unknown): Promise<Pick<Denuncia, "codigo" | "estado">> {
  const parsed = denunciaSchema.safeParse(input);
  if (!parsed.success) throw new ErrorDominio(primerError(parsed.error), 422);
  const { categoria, ubicacion, descripcion } = parsed.data; // lista blanca de campos
  const denuncia = await repo.crearDenuncia({
    codigo: generarCodigoSeguimiento(),
    categoria,
    ubicacion,
    descripcion,
    estado: "Recibida",
  });
  return { codigo: denuncia.codigo, estado: denuncia.estado };
}

/** HU17 (MORD-26): seguimiento por código; no expone la descripción. */
export async function consultarDenuncia(repo: Repositorio, codigo: unknown) {
  const parsed = codigoSeguimientoSchema.safeParse(codigo);
  if (!parsed.success) throw new ErrorDominio(primerError(parsed.error), 422);
  const d = await repo.buscarDenunciaPorCodigo(parsed.data);
  if (!d) throw new ErrorDominio("Código no encontrado", 404);
  return { codigo: d.codigo, categoria: d.categoria, estado: d.estado, actualizadoEn: d.actualizadoEn };
}

/** HU16 (MORD-25): flujo permitido del caso. Solo avanza; "Cerrada" es final. */
export const TRANSICIONES_DENUNCIA: Record<EstadoDenuncia, EstadoDenuncia[]> = {
  Recibida: ["En revisión"],
  "En revisión": ["Derivada", "Cerrada"],
  Derivada: ["Cerrada"],
  Cerrada: [],
};

/** HU16 (MORD-25): bandeja del administrador (solo contenido de la denuncia, sin datos de identidad). */
export async function listarDenunciasAdmin(repo: Repositorio) {
  return repo.listarDenuncias();
}

/** HU16 (MORD-25): cambiar el estado de una denuncia respetando el flujo. */
export async function cambiarEstadoDenuncia(repo: Repositorio, codigo: unknown, input: unknown) {
  const cod = codigoSeguimientoSchema.safeParse(codigo);
  if (!cod.success) throw new ErrorDominio(primerError(cod.error), 422);
  const parsed = cambioEstadoDenunciaSchema.safeParse(input);
  if (!parsed.success) throw new ErrorDominio(primerError(parsed.error), 422);
  const actual = await repo.buscarDenunciaPorCodigo(cod.data);
  if (!actual) throw new ErrorDominio("Código no encontrado", 404);
  if (!TRANSICIONES_DENUNCIA[actual.estado].includes(parsed.data.estado))
    throw new ErrorDominio(`No se puede pasar de «${actual.estado}» a «${parsed.data.estado}»`, 409);
  const d = await repo.actualizarEstadoDenuncia(cod.data, actual.estado, parsed.data.estado);
  if (!d) throw new ErrorDominio("La denuncia cambió mientras la editabas; recarga la bandeja", 409);
  return { codigo: d.codigo, estado: d.estado, actualizadoEn: d.actualizadoEn };
}

/**
 * MORD-33: el comerciante consulta su solicitud con RUC + DNI (no recibe correos).
 * Si el RUC no existe o el DNI no coincide se responde el mismo 404 genérico,
 * para no revelar qué RUC están registrados. No devuelve correo, teléfono ni DNI.
 */
export async function consultarSolicitud(repo: Repositorio, input: unknown) {
  const parsed = consultaSolicitudSchema.safeParse(input);
  if (!parsed.success) throw new ErrorDominio(primerError(parsed.error), 422);
  const c = await repo.buscarComerciantePorRuc(parsed.data.ruc);
  if (!c || c.dni !== parsed.data.dni) throw new ErrorDominio("No encontramos una solicitud con ese RUC y DNI. Revisa los números.", 404);
  return {
    razonSocial: c.razonSocial,
    giro: c.giro,
    estado: c.estado,
    motivoRechazo: c.motivoRechazo ?? null,
    puestoId: c.puestoId ?? null,
    codigoLicencia: c.codigoLicencia ?? null,
    creadoEn: c.creadoEn,
  };
}
