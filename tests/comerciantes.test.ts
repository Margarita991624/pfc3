import { beforeEach, describe, expect, it } from "vitest";
import { RepositorioMemoria } from "@/lib/memoryRepo";
import { asignarPuesto, consultarSolicitud, decidirSolicitud, registrarComerciante, verificarLicencia } from "@/lib/services";
import { ErrorDominio } from "@/lib/errors";

const valido = {
  nombres: "Rosa Quispe Huamán",
  dni: "45678912",
  ruc: "10467793549",
  razonSocial: "Frutas Rosita",
  giro: "Frutas",
  email: "rosa@example.com",
  telefono: "987654321",
};

let repo: RepositorioMemoria;
beforeEach(() => { repo = new RepositorioMemoria(); });

describe("HU01 · Registro de comerciante (MORD-10)", () => {
  it("Dado DNI y RUC válidos, cuando envío, entonces la solicitud queda Pendiente", async () => {
    const c = await registrarComerciante(repo, valido);
    expect(c.estado).toBe("Pendiente");
    expect(c.codigoLicencia).toBeNull();
  });
  it("Dado un RUC ya registrado, cuando envío, entonces responde 'RUC ya registrado' sin duplicar", async () => {
    await registrarComerciante(repo, valido);
    await expect(registrarComerciante(repo, valido)).rejects.toThrow("RUC ya registrado");
    expect(repo.comerciantes).toHaveLength(1);
  });
  it("rechaza un RUC con dígito verificador inválido con status 422", async () => {
    await expect(registrarComerciante(repo, { ...valido, ruc: "10467793540" })).rejects.toMatchObject({ status: 422 });
  });
});

describe("HU02 · Aprobación de solicitudes (MORD-11)", () => {
  it("Dado una solicitud Pendiente, cuando la apruebo, entonces pasa a Aprobado con código de licencia", async () => {
    const c = await registrarComerciante(repo, valido);
    const a = await decidirSolicitud(repo, c.id, { decision: "aprobar" });
    expect(a.estado).toBe("Aprobado");
    expect(a.codigoLicencia).toMatch(/^LIC-[A-Z0-9]{6}$/);
  });
  it("Dado que rechazo, cuando no ingreso motivo, entonces no se permite", async () => {
    const c = await registrarComerciante(repo, valido);
    await expect(decidirSolicitud(repo, c.id, { decision: "rechazar", motivo: "" })).rejects.toBeInstanceOf(ErrorDominio);
    expect((await repo.buscarComerciantePorId(c.id))?.estado).toBe("Pendiente");
  });
  it("rechaza con motivo y no permite volver a decidir", async () => {
    const c = await registrarComerciante(repo, valido);
    const r = await decidirSolicitud(repo, c.id, { decision: "rechazar", motivo: "Documentos ilegibles en la solicitud" });
    expect(r.estado).toBe("Rechazado");
    await expect(decidirSolicitud(repo, c.id, { decision: "aprobar" })).rejects.toMatchObject({ status: 409 });
  });
});

describe("HU03 · Asignación de puesto (MORD-12)", () => {
  it("Dado un puesto libre, cuando lo asigno, entonces queda ocupado", async () => {
    const c = await registrarComerciante(repo, valido);
    await decidirSolicitud(repo, c.id, { decision: "aprobar" });
    const r = await asignarPuesto(repo, c.id, { puestoId: "A-101" });
    expect(r.puestoId).toBe("A-101");
    expect((await repo.buscarPuesto("A-101"))?.comercianteId).toBe(c.id);
  });
  it("Dado un puesto ocupado, cuando intento asignarlo, entonces 'Puesto no disponible'", async () => {
    const a = await registrarComerciante(repo, valido);
    const b = await registrarComerciante(repo, { ...valido, ruc: "20131312955", dni: "12345678" });
    await decidirSolicitud(repo, a.id, { decision: "aprobar" });
    await decidirSolicitud(repo, b.id, { decision: "aprobar" });
    await asignarPuesto(repo, a.id, { puestoId: "A-101" });
    await expect(asignarPuesto(repo, b.id, { puestoId: "A-101" })).rejects.toThrow("Puesto no disponible");
  });
  it("no asigna puestos a comerciantes no aprobados", async () => {
    const c = await registrarComerciante(repo, valido);
    await expect(asignarPuesto(repo, c.id, { puestoId: "A-101" })).rejects.toMatchObject({ status: 409 });
  });
});

describe("HU04 · Verificación de licencia (MORD-13)", () => {
  it("muestra datos públicos de una licencia vigente sin exponer DNI, correo ni teléfono", async () => {
    const c = await registrarComerciante(repo, valido);
    const a = await decidirSolicitud(repo, c.id, { decision: "aprobar" });
    const v = await verificarLicencia(repo, a.codigoLicencia!);
    expect(v.vigente).toBe(true);
    expect(JSON.stringify(v)).not.toContain(valido.dni);
    expect(JSON.stringify(v)).not.toContain(valido.email);
  });
});

describe("MORD-33 · Consulta de la solicitud con RUC y DNI", () => {
  it("Dado un comerciante registrado, cuando consulta con su RUC y DNI, entonces ve su estado sin datos de contacto", async () => {
    await registrarComerciante(repo, valido);
    const r = await consultarSolicitud(repo, { ruc: valido.ruc, dni: valido.dni });
    expect(r.estado).toBe("Pendiente");
    expect(JSON.stringify(r)).not.toContain(valido.email);
    expect(JSON.stringify(r)).not.toContain(valido.telefono);
  });
  it("Dado un DNI que no coincide o un RUC inexistente, entonces responde el mismo 404 genérico", async () => {
    await registrarComerciante(repo, valido);
    const otroDni = await consultarSolicitud(repo, { ruc: valido.ruc, dni: "00000000" }).catch((e) => e);
    const sinRuc = await consultarSolicitud(repo, { ruc: "20100070970", dni: valido.dni }).catch((e) => e);
    expect(otroDni).toMatchObject({ status: 404 });
    expect(sinRuc).toMatchObject({ status: 404, message: otroDni.message });
  });
  it("valida el formato de RUC y DNI (422)", async () => {
    await expect(consultarSolicitud(repo, { ruc: "123", dni: "1" })).rejects.toMatchObject({ status: 422 });
  });
  it("Dado una solicitud aprobada con puesto, entonces muestra el puesto y el código de licencia", async () => {
    const c = await registrarComerciante(repo, valido);
    await decidirSolicitud(repo, c.id, { decision: "aprobar" });
    await asignarPuesto(repo, c.id, { puestoId: "A-101" });
    const r = await consultarSolicitud(repo, { ruc: valido.ruc, dni: valido.dni });
    expect(r).toMatchObject({ estado: "Aprobado", puestoId: "A-101" });
    expect(r.codigoLicencia).toMatch(/^LIC-/);
  });
});
