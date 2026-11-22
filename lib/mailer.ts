import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { Correo } from "./correos";

/**
 * MORD-34: envío de correos por SMTP (Gmail con contraseña de aplicación).
 * Las credenciales viven SOLO en variables de entorno del servidor (Vercel):
 *   SMTP_USER  = cuenta de Gmail que envía
 *   SMTP_PASS  = contraseña de aplicación de 16 caracteres (no la contraseña normal)
 * Si no están configuradas, el envío se omite y el trámite sigue funcionando.
 */
let transporte: Transporter | null | undefined;

function obtenerTransporte(): Transporter | null {
  if (transporte !== undefined) return transporte;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  transporte = user && pass
    ? nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass } })
    : null;
  return transporte;
}

export const correoActivo = () => obtenerTransporte() !== null;

/** Nunca lanza: un fallo de correo no debe romper el registro ni la decisión del admin. */
export async function enviarCorreo(c: Correo): Promise<boolean> {
  const t = obtenerTransporte();
  if (!t) {
    console.info("[correo] desactivado (faltan SMTP_USER/SMTP_PASS); se omite:", c.asunto);
    return false;
  }
  try {
    await t.sendMail({
      from: { name: "MercaOrden", address: process.env.SMTP_USER!.trim() },
      to: c.para,
      subject: c.asunto,
      text: c.texto,
      html: c.html,
    });
    console.info("[correo] enviado:", c.asunto, "→ @" + (c.para.split("@")[1] ?? "?")); // sin la dirección completa (PII)
    return true;
  } catch (e) {
    console.error("[correo] error al enviar:", c.asunto, e instanceof Error ? e.message : "desconocido");
    return false;
  }
}
