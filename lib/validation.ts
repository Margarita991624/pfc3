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

export const codigoSeguimientoSchema = z.string().trim().toUpperCase().regex(/^DEN-[A-Z0-9]{4}-[A-Z0-9]{4}$/, "Formato DEN-XXXX-XXXX");
