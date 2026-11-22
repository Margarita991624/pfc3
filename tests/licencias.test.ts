import { beforeEach, describe, expect, it } from "vitest";
import { RepositorioMemoria } from "@/lib/memoryRepo";
import {
  asignarPuesto, atenderReporte, cambiarEstadoLicencia, consultarSolicitud, decidirSolicitud,
  listarReportesAdmin, registrarComerciante, registrarReporte, verificarLicencia,
} from "@/lib/services";
import { correoLicencia } from "@/lib/correos";

const valido = { nombres: "Rosa Quispe Huamán", dni: "45678912", ruc: "10467793549", razonSocial: "Frutas Rosita", giro: "Frutas", email: "rosa@example.com", telefono: "987654321" };
const motivo = "Reporte de balanza adulterada verificado";

let repo: RepositorioMemoria;
let id: string;
let lic: string;
beforeEach(async () => {
  repo = new RepositorioMemoria();
  id = (await registrarComerciante(repo, valido)).id;
  lic = (await decidirSolicitud(repo, id, { decision: "aprobar" })).codigoLicencia!;
  await asignarPuesto(repo, id, { puestoId: "A-101" });
});

describe("MORD-36 · Ciclo de vida de la licencia", () => {
  it("Dado una licencia vigente, cuando la pongo en revisión, entonces el QR público deja de mostrarla vigente", async () => {
    expect((await verificarLicencia(repo, lic)).vigente).toBe(true);
    await cambiarEstadoLicencia(repo, id, { estado: "En revisión", motivo });
    const v = await verificarLicencia(repo, lic);
    expect(v).toMatchObject({ vigente: false, estadoLicencia: "En revisión" });
    expect((await consultarSolicitud(repo, { ruc: valido.ruc, dni: valido.dni })).licenciaEstado).toBe("En revisión");
  });
  it("puede suspenderse y reactivarse", async () => {
    await cambiarEstadoLicencia(repo, id, { estado: "Suspendida", motivo });
    await cambiarEstadoLicencia(repo, id, { estado: "Vigente", motivo: "Regularizó la balanza y pagó la multa" });
    expect((await verificarLicencia(repo, lic)).vigente).toBe(true);
  });
  it("Dado una revocación, entonces libera el puesto y es definitiva (409 al reactivar)", async () => {
    const c = await cambiarEstadoLicencia(repo, id, { estado: "Revocada", motivo });
    expect(c.puestoId).toBeNull();
    expect(repo.puestos.find((p) => p.id === "A-101")?.comercianteId).toBeNull();
    await expect(cambiarEstadoLicencia(repo, id, { estado: "Vigente", motivo })).rejects.toMatchObject({ status: 409 });
  });
  it("exige motivo, licencia emitida y comerciante existente", async () => {
    await expect(cambiarEstadoLicencia(repo, id, { estado: "Suspendida", motivo: "corto" })).rejects.toMatchObject({ status: 422 });
    await expect(cambiarEstadoLicencia(repo, id, { estado: "Vigente", motivo })).rejects.toMatchObject({ status: 409 });
    await expect(cambiarEstadoLicencia(repo, "no-existe", { estado: "Suspendida", motivo })).rejects.toMatchObject({ status: 404 });
    const otro = await registrarComerciante(repo, { ...valido, ruc: "20100070970", dni: "87654321" });
    await expect(cambiarEstadoLicencia(repo, otro.id, { estado: "Suspendida", motivo })).rejects.toMatchObject({ status: 409 });
  });
  it("envía un correo distinto por cada estado, con el motivo escapado", async () => {
    for (const estado of ["En revisión", "Suspendida", "Vigente", "Revocada"] as const) {
      const c = { ...(await repo.buscarComerciantePorId(id))!, licenciaEstado: estado, licenciaMotivo: "<b>x</b>" };
      const m = correoLicencia(c, "https://x.test");
      expect(m.asunto).toMatch(estado === "Vigente" ? /vigente nuevamente/ : new RegExp(estado.toLowerCase()));
      expect(m.html).toContain("&lt;b&gt;x&lt;/b&gt;");
    }
  });
});

describe("MORD-36 · Reportes ciudadanos de faltas", () => {
  it("Dado un código de licencia válido, cuando reporto una falta, entonces el admin la ve con el comercio y puede atenderla", async () => {
    const r = await registrarReporte(repo, { codigoLicencia: lic.toLowerCase(), categoria: "Balanza o pesos adulterados", descripcion: "La balanza marca 200 g de más en cada kilo." });
    expect(r.codigo).toMatch(/^RPT-[A-Z2-9]{6}$/);
    const [rep] = await listarReportesAdmin(repo);
    expect(rep.comercio).toMatchObject({ id, razonSocial: "Frutas Rosita", licenciaEstado: "Vigente" });
    expect(await atenderReporte(repo, rep.id)).toMatchObject({ estado: "Atendido" });
    await expect(atenderReporte(repo, rep.id)).rejects.toMatchObject({ status: 409 });
    await expect(atenderReporte(repo, "x")).rejects.toMatchObject({ status: 404 });
  });
  it("rechaza licencias inexistentes (404) y datos inválidos (422)", async () => {
    await expect(registrarReporte(repo, { codigoLicencia: "LIC-ZZZZZZ", categoria: "Otro", descripcion: "Descripción suficiente" })).rejects.toMatchObject({ status: 404 });
    await expect(registrarReporte(repo, { codigoLicencia: "x", categoria: "Otro", descripcion: "Descripción suficiente" })).rejects.toMatchObject({ status: 422 });
  });
});
