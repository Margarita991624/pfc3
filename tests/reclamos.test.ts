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
