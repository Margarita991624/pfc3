import "server-only";
import { RepositorioMemoria } from "./memoryRepo";
import { RepositorioSupabase } from "./supabaseRepo";
import type { Repositorio } from "./types";

let instancia: Repositorio | null = null;

/** Supabase si hay credenciales; si no, modo demo en memoria (solo para desarrollo local). */
export function obtenerRepositorio(): Repositorio {
  if (instancia) return instancia;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  instancia = url && key ? new RepositorioSupabase(url, key) : new RepositorioMemoria();
  return instancia;
}

export const modoDemo = () => !(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
