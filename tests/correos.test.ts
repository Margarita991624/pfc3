import { describe, expect, it } from "vitest";
import { correoDecision, correoPuestoAsignado, correoSolicitudRecibida, escaparHtml } from "@/lib/correos";
import type { Comerciante } from "@/lib/types";

const base: Comerciante = {
  id: "1", nombres: "Rosa Quispe", dni: "45678912", ruc: "10467793549", razonSocial: "Frutas Rosita", giro: "Frutas",
  email: "rosa@example.com", telefono: "987654321", estado: "Pendiente", motivoRechazo: null, codigoLicencia: null, puestoId: null,
  creadoEn: "2026-11-21T00:00:00Z",
} as Comerciante;
const URL_BASE = "https://pfc3-ruddy.vercel.app";

describe("MORD-34 · Plantillas de correo al comerciante", () => {
  it("Dado un registro, el correo de recibido va al comerciante con el estado y sin el DNI completo", () => {
    const c = correoSolicitudRecibida(base, URL_BASE);
    expect(c.para).toBe("rosa@example.com");
    expect(c.texto).toContain("Pendiente");
    expect(c.html).toContain(`${URL_BASE}/comerciantes/estado`);
    expect(c.html + c.texto).not.toContain("45678912");
    expect(c.texto).toContain("8912");
  });
  it("Dado una aprobación o un rechazo, el asunto y el contenido cambian (el rechazo incluye el motivo)", () => {
    expect(correoDecision({ ...base, estado: "Aprobado", codigoLicencia: "LIC-ABC123" }, URL_BASE).asunto).toMatch(/aprobada/);
    const r = correoDecision({ ...base, estado: "Rechazado", motivoRechazo: "RUC no activo en SUNAT" }, URL_BASE);
    expect(r.asunto).toMatch(/no fue aprobada/);
    expect(r.html).toContain("RUC no activo en SUNAT");
  });
  it("Dado un puesto asignado, el correo enlaza a la licencia pública con QR", () => {
    const c = correoPuestoAsignado({ ...base, estado: "Aprobado", codigoLicencia: "LIC-ABC123", puestoId: "A-101" }, URL_BASE);
    expect(c.asunto).toContain("A-101");
    expect(c.html).toContain(`${URL_BASE}/licencia/LIC-ABC123`);
  });
  it("escapa el HTML de los datos del usuario (sin inyección en el correo)", () => {
    const c = correoSolicitudRecibida({ ...base, razonSocial: '<img src=x onerror="alert(1)">' }, URL_BASE);
    expect(c.html).not.toContain("<img src=x");
    expect(c.html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(escaparHtml(`'&`)).toBe("&#39;&amp;");
  });
});
