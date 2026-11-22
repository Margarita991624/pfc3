import type { Reclamo } from "./types";
import { CONTACTO_EMAIL } from "./contacto";

/**
 * MORD-35: borrador formal de respuesta a una hoja del Libro de Reclamaciones.
 * Las partes entre corchetes [ ] debe completarlas la administración; el backend
 * no permite enviar la respuesta mientras queden corchetes sin completar.
 */
export function plantillaRespuestaReclamo(r: Pick<Reclamo, "tipo" | "codigo" | "nombres" | "creadoEn" | "descripcionBien" | "pedido">): string {
  const fecha = new Date(r.creadoEn).toLocaleDateString("es-PE", { timeZone: "America/Lima", day: "2-digit", month: "long", year: "numeric" });
  const tipo = r.tipo === "Queja" ? "queja" : "reclamo";
  return [
    `Estimado(a) ${r.nombres}:`,
    `Por medio de la presente, damos respuesta a su ${tipo} N.º ${r.codigo}, registrado en nuestro Libro de Reclamaciones el ${fecha}, referido a «${r.descripcionBien}».`,
    `Luego de evaluar su caso, le informamos lo siguiente: [describa aquí lo que se revisó y lo que se verificó].`,
    `Respecto a su pedido («${r.pedido}»), [indique la solución o medida adoptada y el plazo en que se realizará].`,
    `Agradecemos que nos haya comunicado su ${tipo}, pues nos ayuda a mejorar la atención en el Mercado Mayorista. Si no se encuentra conforme con esta respuesta, puede acudir al INDECOPI.`,
    `Atentamente,\nAdministración del Mercado Mayorista – MercaOrden\n${CONTACTO_EMAIL}`,
  ].join("\n\n");
}
