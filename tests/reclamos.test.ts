import { beforeEach, describe, expect, it } from "vitest";
import { RepositorioMemoria } from "@/lib/memoryRepo";
import { registrarReclamo } from "@/lib/services";
import { correosReclamo } from "@/lib/correos";

const hoja = {
  tipo: "Reclamo", nombres: "Juana Pérez Ramos", documento: "45678912", domicilio: "Av. Las Flores 123, Lima", email: "juana@example.com",
  telefono: "", apoderado: "", bienTipo: "Servicio", monto: "", descripcionBien: "Atención en la plataforma MercaOrden",
  detalle: "Registré mi solicitud hace tres semanas y sigue sin respuesta.", pedido: "Que revisen mi solicitud.", acepta: true,
};

let repo: RepositorioMemoria;
beforeEach(() => { repo = new RepositorioMemoria(); });

describe("MORD-35 · Libro de Reclamaciones", () => {
  it("Dado una hoja válida, cuando la envío, entonces se registra con número REC-AAAA-XXXXXX", async () => {
    const r = await registrarReclamo(repo, hoja);
    expect(r.codigo).toMatch(new RegExp(`^REC-${new Date().getFullYear()}-[A-Z2-9]{6}$`));
    expect(r).toMatchObject({ telefono: null, apoderado: null, monto: null });
    expect(repo.reclamos).toHaveLength(1);
  });
  it("exige aceptar los términos y validar los campos obligatorios (422)", async () => {
    await expect(registrarReclamo(repo, { ...hoja, acepta: false })).rejects.toMatchObject({ status: 422 });
    await expect(registrarReclamo(repo, { ...hoja, detalle: "corto" })).rejects.toMatchObject({ status: 422 });
    await expect(registrarReclamo(repo, { ...hoja, tipo: "Otro" })).rejects.toMatchObject({ status: 422 });
  });
  it("acepta monto numérico y genera la constancia al consumidor y el aviso al centro de contacto", async () => {
    const r = await registrarReclamo(repo, { ...hoja, bienTipo: "Producto", monto: "35.5" });
    expect(r.monto).toBe(35.5);
    const [consumidor, contacto] = correosReclamo(r, "contacto@example.com");
    expect(consumidor.para).toBe("juana@example.com");
    expect(consumidor.html).toContain("15 días hábiles");
    expect(consumidor.html).toContain("INDECOPI");
    expect(contacto.para).toBe("contacto@example.com");
    expect(contacto.asunto).toContain(r.codigo);
  });
});

describe("MORD-35 · Constancia con datos opcionales", () => {
  it("incluye teléfono, apoderado y monto cuando el consumidor los indica", async () => {
    const r = await registrarReclamo(repo, { ...hoja, telefono: "987654321", apoderado: "María Ramos", bienTipo: "Producto", monto: "120" });
    const [consumidor] = correosReclamo(r, "c@example.com");
    expect(consumidor.html).toContain("987654321");
    expect(consumidor.html).toContain("María Ramos");
    expect(consumidor.html).toContain("S/ 120.00");
    expect(consumidor.texto).toContain("15 días hábiles");
  });
  it("registra quejas además de reclamos", async () => {
    const r = await registrarReclamo(repo, { ...hoja, tipo: "Queja" });
    expect(correosReclamo(r, "c@example.com")[1].asunto).toContain("queja");
  });
});

describe("MORD-35 · Responder hojas del Libro de Reclamaciones", () => {
  it("cuenta días hábiles (sin sábados ni domingos) desde el día siguiente al registro", async () => {
    const { diasHabilesTranscurridos } = await import("@/lib/services");
    expect(diasHabilesTranscurridos(new Date("2026-11-20T15:00:00Z"), new Date("2026-11-20T20:00:00Z"))).toBe(0); // mismo día
    expect(diasHabilesTranscurridos(new Date("2026-11-20T15:00:00Z"), new Date("2026-11-23T15:00:00Z"))).toBe(1); // vie → lun
    expect(diasHabilesTranscurridos(new Date("2026-11-20T15:00:00Z"), new Date("2026-11-30T15:00:00Z"))).toBe(6);
  });
  it("la bandeja muestra los días restantes del plazo de 15 días hábiles", async () => {
    const { listarReclamosAdmin } = await import("@/lib/services");
    const r = await registrarReclamo(repo, hoja);
    const [item] = await listarReclamosAdmin(repo, new Date(r.creadoEn));
    expect(item).toMatchObject({ estado: "Recibido", diasRestantes: 15 });
  });
  it("el borrador formal incluye número, referencia, INDECOPI y obliga a completar los corchetes", async () => {
    const { plantillaRespuestaReclamo } = await import("@/lib/plantillaReclamo");
    const { responderReclamo } = await import("@/lib/services");
    const r = await registrarReclamo(repo, hoja);
    const borrador = plantillaRespuestaReclamo(r);
    expect(borrador).toContain(r.codigo);
    expect(borrador).toContain("INDECOPI");
    await expect(responderReclamo(repo, r.id, { respuesta: borrador })).rejects.toMatchObject({ status: 422 });
    const final = borrador.replace(/\[[^\]]*\]/g, "se revisó su solicitud y se atenderá en 48 horas");
    const ok = await responderReclamo(repo, r.id, { respuesta: final });
    expect(ok).toMatchObject({ estado: "Respondido", respuesta: final });
    await expect(responderReclamo(repo, r.id, { respuesta: final })).rejects.toMatchObject({ status: 409 });
    await expect(responderReclamo(repo, "x", { respuesta: final })).rejects.toMatchObject({ status: 404 });
  });
  it("el correo de respuesta va al consumidor con el texto escapado", async () => {
    const { correoRespuestaReclamo } = await import("@/lib/correos");
    const r = await registrarReclamo(repo, hoja);
    const c = correoRespuestaReclamo({ ...r, respuesta: "Hola <b>Juana</b>\n\nSegundo párrafo" });
    expect(c.para).toBe("juana@example.com");
    expect(c.asunto).toContain(r.codigo);
    expect(c.html).toContain("&lt;b&gt;Juana&lt;/b&gt;");
  });
});
