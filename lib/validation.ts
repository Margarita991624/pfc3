import { z } from "zod";
import { esDniValido, esRucValido } from "./ruc";

export const GIROS = ["Frutas", "Verduras", "Tubérculos", "Abarrotes", "Otros"] as const;

export const registroComercianteSchema = z.object({
  nombres: z.string().trim().min(3, "Ingrese nombres completos").max(120),
  dni: z.string().trim().refine(esDniValido, "El DNI debe tener 8 dígitos"),
  ruc: z.string().trim().refine(esRucValido, "RUC inválido (11 dígitos y dígito verificador SUNAT)"),
  razonSocial: z.string().trim().min(3).max(160),
  giro: z.enum(GIROS),
  email: z.string().trim().email("Correo inválido"),
  telefono: z.string().trim().regex(/^9\d{8}$/, "Celular de 9 dígitos que empiece en 9"),
});
/** MORD-33: consulta pública del estado de la solicitud (sin correo): RUC + DNI. */
export const consultaSolicitudSchema = z.object({
  ruc: z.string().trim().regex(/^\d{11}$/, "El RUC debe tener 11 dígitos"),
  dni: z.string().trim().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
});

export type RegistroComerciante = z.infer<typeof registroComercianteSchema>;

export const decisionSchema = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("aprobar") }),
  z.object({
    decision: z.literal("rechazar"),
    motivo: z.string().trim().min(10, "El motivo del rechazo es obligatorio (mín. 10 caracteres)"),
  }),
]);

export const asignacionPuestoSchema = z.object({
  puestoId: z.string().min(1),
});

export const CATEGORIAS_DENUNCIA = ["Cobro de cupos", "Extorsión", "Violencia o amenazas", "Estibaje ilegal", "Otro"] as const;

export const denunciaSchema = z.object({
  categoria: z.enum(CATEGORIAS_DENUNCIA),
  ubicacion: z.string().trim().min(3, "Indique bloque, puerta o zona").max(120),
  descripcion: z.string().trim().min(20, "Describa lo ocurrido (mín. 20 caracteres)").max(2000),
});
export type NuevaDenuncia = z.infer<typeof denunciaSchema>;

export const cambioEstadoDenunciaSchema = z.object({
  estado: z.enum(["En revisión", "Derivada", "Cerrada"], { message: "Estado no válido" }),
});

/** MORD-36: cambio de estado de licencia y reportes de faltas. */
export const cambioLicenciaSchema = z.object({
  estado: z.enum(["Vigente", "En revisión", "Suspendida", "Revocada"], { message: "Estado de licencia no válido" }),
  motivo: z.string().trim().min(10, "Escribe el motivo (al menos 10 caracteres)").max(500),
});
export const CATEGORIAS_REPORTE = ["Precios abusivos o especulación", "Balanza o pesos adulterados", "Insalubridad o productos en mal estado", "Ocupa más espacio del asignado", "Opera otro giro o sin licencia visible", "Maltrato al cliente", "Otro"] as const;
export const reporteSchema = z.object({
  codigoLicencia: z.string().trim().toUpperCase().regex(/^LIC-[A-Z0-9]{6}$/, "Código de licencia inválido (LIC-XXXXXX)"),
  categoria: z.enum(CATEGORIAS_REPORTE, { message: "Elige qué tipo de falta viste" }),
  descripcion: z.string().trim().min(10, "Cuéntanos qué viste (al menos 10 caracteres)").max(2000),
});

export const respuestaReclamoSchema = z.object({
  respuesta: z.string().trim().min(60, "La respuesta es muy corta: explica la evaluación y la solución").max(5000)
    .refine((t) => !/\[[^\]]*\]/.test(t), "Completa o borra las partes entre corchetes [ ] antes de enviar"),
});

/** MORD-35: hoja del Libro de Reclamaciones virtual. */
const opcional = (max: number) => z.string().trim().max(max).optional().transform((v) => (v ? v : null));
export const reclamoSchema = z.object({
  tipo: z.enum(["Reclamo", "Queja"], { message: "Elige si es un reclamo o una queja" }),
  nombres: z.string().trim().min(3, "Escribe tu nombre completo").max(120),
  documento: z.string().trim().regex(/^[A-Za-z0-9]{8,12}$/, "Escribe tu DNI o carné de extranjería (8 a 12 caracteres)"),
  domicilio: z.string().trim().min(5, "Escribe tu domicilio").max(200),
  email: z.string().trim().email("Correo inválido"),
  telefono: opcional(15),
  apoderado: opcional(120),
  bienTipo: z.enum(["Producto", "Servicio"], { message: "Elige producto o servicio" }),
  monto: z.union([z.literal(""), z.coerce.number().min(0).max(1_000_000)]).optional().transform((v) => (v === "" || v === undefined ? null : v)),
  descripcionBien: z.string().trim().min(3, "Describe el producto o servicio").max(300),
  detalle: z.string().trim().min(10, "Cuéntanos qué pasó (al menos 10 caracteres)").max(3000),
  pedido: z.string().trim().min(5, "Indica qué solución pides").max(1500),
  acepta: z.literal(true, { message: "Debes aceptar los términos para continuar" }),
});

export const codigoSeguimientoSchema = z.string().trim().toUpperCase().regex(/^DEN-[A-Z0-9]{4}-[A-Z0-9]{4}$/, "Formato DEN-XXXX-XXXX");
