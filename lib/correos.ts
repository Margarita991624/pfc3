/**
 * MORD-34: plantillas de correo para el comerciante (funciones puras, testeables).
 * Los datos ingresados por el usuario se escapan antes de ir al HTML (evita inyección
 * de HTML en el correo). Nunca se incluyen el DNI completo ni datos de denuncias.
 */
import type { Comerciante } from "./types";

export type Correo = { para: string; asunto: string; texto: string; html: string };

export const escaparHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const dniOculto = (dni: string) => "••••" + dni.slice(-4);

function plantilla(titulo: string, color: string, parrafos: string[], boton?: { texto: string; url: string }) {
  const cuerpo = parrafos.map((p) => `<p style="font-size:17px;line-height:1.6;margin:0 0 14px;color:#10241a">${p}</p>`).join("");
  const cta = boton
    ? `<p style="margin:24px 0"><a href="${escaparHtml(boton.url)}" style="background:#1d6b41;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700;font-size:17px;display:inline-block">${escaparHtml(boton.texto)}</a></p>`
    : "";
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f6f1e6;font-family:Segoe UI,Roboto,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border:1px solid #e2dccd;border-radius:16px">
<tr><td style="height:6px;background:${color};border-radius:16px 16px 0 0"></td></tr>
<tr><td style="padding:28px">
<p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#1d6b41;font-weight:700;margin:0 0 8px">MercaOrden · Mercado Mayorista</p>
<h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 18px;color:#10241a">${titulo}</h1>
${cuerpo}${cta}
<p style="font-size:13px;color:#5c6b62;margin:20px 0 0">Este es un mensaje automático; no respondas a este correo. Si tienes dudas, acércate a la oficina de administración del mercado con tu DNI.</p>
</td></tr></table></td></tr></table></body></html>`;
}

/** Texto plano equivalente (clientes de correo sin HTML y lectores de pantalla). */
const plano = (titulo: string, lineas: string[]) => [titulo, "", ...lineas, "", "— MercaOrden · Mercado Mayorista (mensaje automático)"].join("\n");

export function correoSolicitudRecibida(c: Comerciante, urlBase: string): Correo {
  const n = escaparHtml(c.razonSocial);
  const url = `${urlBase}/comerciantes/estado`;
  return {
    para: c.email,
    asunto: "Recibimos tu solicitud – MercaOrden",
    texto: plano("Recibimos tu solicitud", [
      `Negocio: ${c.razonSocial} · RUC ${c.ruc} · DNI ${dniOculto(c.dni)}`,
      "Estado: Pendiente. La administración del mercado revisará tus datos.",
      "No tienes que hacer nada más. Te avisaremos por este medio cuando haya una respuesta.",
      `También puedes consultar con tu RUC y tu DNI en: ${url}`,
    ]),
    html: plantilla("¡Recibimos tu solicitud!", "#f0a432", [
      `Hola, registramos la solicitud de <b>${n}</b> (RUC <b>${escaparHtml(c.ruc)}</b>, DNI ${dniOculto(c.dni)}).`,
      "<b>Estado: Pendiente.</b> La administración del mercado revisará tus datos.",
      "<b>No tienes que hacer nada más.</b> Te escribiremos cuando haya una respuesta. Revisa también tu carpeta de spam.",
      "Si quieres ver cómo va, entra a «Mi solicitud» y escribe tu RUC y tu DNI.",
    ], { texto: "Ver mi solicitud", url }),
  };
}

export function correoDecision(c: Comerciante, urlBase: string): Correo {
  const n = escaparHtml(c.razonSocial);
  const url = `${urlBase}/comerciantes/estado`;
  if (c.estado === "Aprobado")
    return {
      para: c.email,
      asunto: "¡Tu solicitud fue aprobada! – MercaOrden",
      texto: plano("¡Tu solicitud fue aprobada!", [
        `Negocio: ${c.razonSocial} · Licencia ${c.codigoLicencia ?? ""}`,
        "Solo falta que la administración te asigne un puesto. Te avisaremos por este medio.",
        `Consulta tu solicitud con tu RUC y tu DNI en: ${url}`,
      ]),
      html: plantilla("¡Tu solicitud fue aprobada!", "#1d6b41", [
        `La solicitud de <b>${n}</b> fue <b>aprobada</b>. Tu código de licencia es <b>${escaparHtml(c.codigoLicencia ?? "")}</b>.`,
        "<b>¿Qué sigue?</b> Solo falta que la administración te asigne un puesto. Te avisaremos por este medio.",
      ], { texto: "Ver mi solicitud", url }),
    };
  return {
    para: c.email,
    asunto: "Tu solicitud no fue aprobada – MercaOrden",
    texto: plano("Tu solicitud no fue aprobada", [
      `Negocio: ${c.razonSocial}`,
      `Motivo: ${c.motivoRechazo ?? "—"}`,
      "Acércate a la oficina de administración del mercado con tu DNI y tu ficha RUC para corregir lo que falte.",
    ]),
    html: plantilla("Tu solicitud no fue aprobada", "#d2452a", [
      `La solicitud de <b>${n}</b> no fue aprobada.`,
      `<b>Motivo:</b> ${escaparHtml(c.motivoRechazo ?? "—")}`,
      "<b>¿Qué hago?</b> Acércate a la oficina de administración del mercado con tu DNI y tu ficha RUC para corregir lo que falte.",
    ]),
  };
}

export function correoPuestoAsignado(c: Comerciante, urlBase: string): Correo {
  const n = escaparHtml(c.razonSocial);
  const url = `${urlBase}/licencia/${encodeURIComponent(c.codigoLicencia ?? "")}`;
  return {
    para: c.email,
    asunto: `Te asignamos el puesto ${c.puestoId ?? ""} – MercaOrden`,
    texto: plano("¡Ya eres comerciante formalizado!", [
      `Negocio: ${c.razonSocial} · Puesto ${c.puestoId ?? ""} · Licencia ${c.codigoLicencia ?? ""}`,
      "Imprime tu licencia y colócala en un lugar visible de tu puesto, o guárdala en tu celular.",
      `Tu licencia con código QR: ${url}`,
    ]),
    html: plantilla("¡Ya eres comerciante formalizado!", "#1d6b41", [
      `<b>${n}</b> tiene asignado el puesto <b style="font-size:22px">${escaparHtml(c.puestoId ?? "")}</b>.`,
      "<b>¿Qué hago ahora?</b> Abre tu licencia con el botón, imprímela y colócala en un lugar visible de tu puesto, o guárdala en tu celular.",
      "Si un inspector o cliente escanea el QR, verá que tu negocio es formal. Nunca verá tu DNI ni tu teléfono.",
    ], { texto: "Ver mi licencia con QR", url }),
  };
}

/** MORD-35: constancia para el consumidor y aviso al centro de contacto. */
export function correosReclamo(r: import("./types").Reclamo, contacto: string): Correo[] {
  const fila = (k: string, v: string) => `<tr><td style="padding:6px 10px;color:#5c6b62;font-size:14px">${k}</td><td style="padding:6px 10px;font-size:15px"><b>${escaparHtml(v)}</b></td></tr>`;
  const tabla = `<table role="presentation" style="border-collapse:collapse;width:100%;background:#f6f1e6;border-radius:10px">${[
    fila("Hoja N.º", r.codigo), fila("Tipo", r.tipo), fila("Fecha", new Date(r.creadoEn).toLocaleString("es-PE", { timeZone: "America/Lima" })),
    fila("Consumidor", r.nombres), fila("Documento", r.documento), fila("Domicilio", r.domicilio), fila("Correo", r.email),
    ...(r.telefono ? [fila("Teléfono", r.telefono)] : []), ...(r.apoderado ? [fila("Padre, madre o apoderado", r.apoderado)] : []),
    fila(r.bienTipo, r.descripcionBien), ...(r.monto !== null ? [fila("Monto reclamado", `S/ ${r.monto.toFixed(2)}`)] : []),
    fila("Detalle", r.detalle), fila("Pedido", r.pedido),
  ].join("")}</table>`;
  const textoBase = [
    `Hoja N.º ${r.codigo} · ${r.tipo} · ${r.nombres} (${r.documento})`,
    `${r.bienTipo}: ${r.descripcionBien}`,
    `Detalle: ${r.detalle}`,
    `Pedido: ${r.pedido}`,
  ];
  return [
    {
      para: r.email,
      asunto: `Constancia de tu ${r.tipo.toLowerCase()} N.º ${r.codigo} – Libro de Reclamaciones`,
      texto: plano("Recibimos tu hoja de reclamación", [...textoBase, "", "Te responderemos a este correo en un plazo máximo de 15 días hábiles.", `Consultas: ${contacto}`]),
      html: plantilla("Recibimos tu hoja de reclamación", "#10241a", [
        `Registramos tu <b>${escaparHtml(r.tipo.toLowerCase())}</b> con el número <b>${escaparHtml(r.codigo)}</b>. Guarda este correo como constancia.`,
        tabla,
        "<b>¿Qué sigue?</b> Te responderemos a este correo en un plazo máximo de <b>15 días hábiles</b>.",
        "La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.",
      ]),
    },
    {
      para: contacto,
      asunto: `[Libro de Reclamaciones] Nueva ${r.tipo.toLowerCase()} ${r.codigo}`,
      texto: plano(`Nueva ${r.tipo.toLowerCase()} registrada`, [...textoBase, `Responder a: ${r.email}`, "Plazo máximo de respuesta: 15 días hábiles."]),
      html: plantilla(`Nueva ${escaparHtml(r.tipo.toLowerCase())} registrada`, "#d2452a", [
        tabla,
        `<b>Plazo máximo de respuesta: 15 días hábiles.</b> Responde al consumidor en <b>${escaparHtml(r.email)}</b>.`,
      ]),
    },
  ];
}

/** MORD-34: elige el aviso que corresponde al estado actual (para reenviarlo desde el panel). */
export function correoSegunEstado(c: Comerciante, urlBase: string): Correo {
  if (c.estado === "Pendiente") return correoSolicitudRecibida(c, urlBase);
  if (c.estado === "Aprobado" && c.puestoId) return correoPuestoAsignado(c, urlBase);
  return correoDecision(c, urlBase);
}
