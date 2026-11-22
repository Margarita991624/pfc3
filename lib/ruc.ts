/**
 * Validación de RUC peruano (SUNAT): 11 dígitos, prefijo válido y dígito verificador módulo 11.
 * HU01 (MORD-10): el sistema valida el RUC antes de crear la solicitud.
 */
const PESOS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
const PREFIJOS_VALIDOS = ["10", "15", "16", "17", "20"];

export function esRucValido(ruc: string): boolean {
  if (!/^\d{11}$/.test(ruc)) return false;
  if (!PREFIJOS_VALIDOS.includes(ruc.slice(0, 2))) return false;
  const suma = PESOS.reduce((acc, peso, i) => acc + peso * Number(ruc[i]), 0);
  let digito = 11 - (suma % 11);
  if (digito === 10) digito = 0;
  if (digito === 11) digito = 1;
  return digito === Number(ruc[10]);
}

export function esDniValido(dni: string): boolean {
  return /^\d{8}$/.test(dni);
}
