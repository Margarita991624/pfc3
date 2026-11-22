import { beforeEach, describe, expect, it } from "vitest";
import { RepositorioMemoria } from "@/lib/memoryRepo";
import { consultarDenuncia, registrarDenuncia } from "@/lib/services";
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
