import { beforeEach, describe, expect, it } from "vitest";
import { RepositorioMemoria } from "@/lib/memoryRepo";
import { cambiarEstadoDenuncia, consultarDenuncia, listarDenunciasAdmin, registrarDenuncia } from "@/lib/services";
import { generarCodigoSeguimiento } from "@/lib/tracking";

const denuncia = {
  categoria: "Cobro de cupos",
  ubicacion: "Bloque B, puerta 3",
  descripcion: "Un grupo exige S/ 20 diarios a los estibadores para dejarlos trabajar.",
};

let repo: RepositorioMemoria;
beforeEach(() => { repo = new RepositorioMemoria(); });

describe("HU15 · Denuncia anónima (MORD-24)", () => {
  it("Dado una denuncia válida, cuando la envío, entonces recibo un código de seguimiento", async () => {
    const r = await registrarDenuncia(repo, denuncia);
    expect(r.codigo).toMatch(/^DEN-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(r.estado).toBe("Recibida");
  });
  it("no guarda identidad ni IP aunque el cliente las envíe (lista blanca de campos)", async () => {
    await registrarDenuncia(repo, { ...denuncia, nombre: "Juan Pérez", dni: "12345678", ip: "190.12.3.4" });
    const guardada = repo.denuncias[0] as unknown as Record<string, unknown>;
    expect(Object.keys(guardada).sort()).toEqual(["actualizadoEn", "categoria", "codigo", "creadoEn", "descripcion", "estado", "id", "ubicacion"]);
    expect(JSON.stringify(guardada)).not.toMatch(/Juan|12345678|190\.12/);
  });
  it("valida la descripción mínima", async () => {
    await expect(registrarDenuncia(repo, { ...denuncia, descripcion: "corto" })).rejects.toMatchObject({ status: 422 });
  });
  it("genera códigos distintos (aleatorios)", () => {
    const codigos = new Set(Array.from({ length: 500 }, generarCodigoSeguimiento));
    expect(codigos.size).toBe(500);
  });
});

describe("HU17 · Seguimiento de denuncia (MORD-26)", () => {
  it("Dado un código válido, cuando lo consulto, entonces veo estado y fecha sin la descripción", async () => {
    const { codigo } = await registrarDenuncia(repo, denuncia);
    const r = await consultarDenuncia(repo, codigo.toLowerCase());
    expect(r.estado).toBe("Recibida");
    expect(r).not.toHaveProperty("descripcion");
  });
  it("Dado un código inexistente, entonces 'Código no encontrado'", async () => {
    await expect(consultarDenuncia(repo, "DEN-AAAA-BBBB")).rejects.toThrow("Código no encontrado");
  });
});

describe("HU16 · Gestionar y derivar denuncias (MORD-25)", () => {
  it("Dado denuncias registradas, cuando el admin abre la bandeja, entonces las ve de la más reciente a la más antigua", async () => {
    const a = await registrarDenuncia(repo, denuncia);
    await new Promise((r) => setTimeout(r, 5));
    const b = await registrarDenuncia(repo, { ...denuncia, categoria: "Extorsión" });
    const lista = await listarDenunciasAdmin(repo);
    expect(lista.map((d) => d.codigo)).toEqual([b.codigo, a.codigo]);
  });
  it("Dado una denuncia Recibida, cuando la reviso, la derivo y la cierro, entonces avanza por el flujo", async () => {
    const { codigo } = await registrarDenuncia(repo, denuncia);
    expect((await cambiarEstadoDenuncia(repo, codigo, { estado: "En revisión" })).estado).toBe("En revisión");
    expect((await cambiarEstadoDenuncia(repo, codigo, { estado: "Derivada" })).estado).toBe("Derivada");
    expect((await cambiarEstadoDenuncia(repo, codigo, { estado: "Cerrada" })).estado).toBe("Cerrada");
    expect((await consultarDenuncia(repo, codigo)).estado).toBe("Cerrada");
  });
  it("no permite saltar etapas ni reabrir una denuncia cerrada (409)", async () => {
    const { codigo } = await registrarDenuncia(repo, denuncia);
    await expect(cambiarEstadoDenuncia(repo, codigo, { estado: "Cerrada" })).rejects.toMatchObject({ status: 409 });
    await cambiarEstadoDenuncia(repo, codigo, { estado: "En revisión" });
    await cambiarEstadoDenuncia(repo, codigo, { estado: "Cerrada" });
    await expect(cambiarEstadoDenuncia(repo, codigo, { estado: "En revisión" })).rejects.toMatchObject({ status: 409 });
  });
  it("valida el estado y el código (422) y responde 404 si no existe", async () => {
    const { codigo } = await registrarDenuncia(repo, denuncia);
    await expect(cambiarEstadoDenuncia(repo, codigo, { estado: "Recibida" })).rejects.toMatchObject({ status: 422 });
    await expect(cambiarEstadoDenuncia(repo, "xx", { estado: "En revisión" })).rejects.toMatchObject({ status: 422 });
    await expect(cambiarEstadoDenuncia(repo, "DEN-0000-0000", { estado: "En revisión" })).rejects.toMatchObject({ status: 404 });
  });
});
