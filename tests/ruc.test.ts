import { describe, expect, it } from "vitest";
import { esDniValido, esRucValido } from "@/lib/ruc";

describe("Validación de RUC (HU01 · MORD-10)", () => {
  it("acepta un RUC de persona jurídica con dígito verificador correcto", () => {
    expect(esRucValido("20131312955")).toBe(true); // SUNAT
  });
  it("acepta un RUC de persona natural (prefijo 10) válido", () => {
    expect(esRucValido("10467793549")).toBe(true);
  });
  it("rechaza un RUC con dígito verificador incorrecto", () => {
    expect(esRucValido("20131312956")).toBe(false);
  });
  it("rechaza longitudes distintas de 11 y caracteres no numéricos", () => {
    expect(esRucValido("2013131295")).toBe(false);
    expect(esRucValido("2013131295A")).toBe(false);
  });
  it("rechaza prefijos no válidos", () => {
    expect(esRucValido("30131312955")).toBe(false);
  });
});

describe("Validación de DNI", () => {
  it("exige exactamente 8 dígitos", () => {
    expect(esDniValido("45678912")).toBe(true);
    expect(esDniValido("4567891")).toBe(false);
    expect(esDniValido("4567891a")).toBe(false);
  });
});
