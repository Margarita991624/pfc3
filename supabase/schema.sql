-- MercaOrden · esquema PostgreSQL (Supabase)
-- Ejecutar en Supabase → SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.comerciantes (
  id uuid primary key default gen_random_uuid(),
  nombres text not null,
  dni char(8) not null,
  ruc char(11) not null unique,               -- HU01: RUC único
  razon_social text not null,
  giro text not null,
  email text not null,
  telefono text not null,
  estado text not null default 'Pendiente' check (estado in ('Pendiente','Aprobado','Rechazado')),
  motivo_rechazo text,
  codigo_licencia text unique,
  puesto_id text,
  creado_en timestamptz not null default now(),
  constraint rechazo_con_motivo check (estado <> 'Rechazado' or length(coalesce(motivo_rechazo,'')) >= 10)
);

create table if not exists public.puestos (
  id text primary key,
  bloque text not null,
  numero int not null,
  giro text not null,
  comerciante_id uuid unique references public.comerciantes(id)
);

-- HU15: la tabla de denuncias NO tiene columnas de identidad, IP ni user-agent.
create table if not exists public.denuncias (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  categoria text not null,
  ubicacion text not null,
  descripcion text not null,
  estado text not null default 'Recibida' check (estado in ('Recibida','En revisión','Derivada','Cerrada')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- Seguridad: RLS activado y sin políticas para anon/authenticated.
-- Solo el backend (service_role, en variables de entorno de Vercel) puede leer/escribir.
alter table public.comerciantes enable row level security;
alter table public.puestos      enable row level security;
alter table public.denuncias    enable row level security;

insert into public.puestos (id, bloque, numero, giro) values
  ('A-101','A',101,'Frutas'), ('A-102','A',102,'Frutas'), ('A-103','A',103,'Frutas'),
  ('B-201','B',201,'Verduras'), ('B-202','B',202,'Verduras'),
  ('C-301','C',301,'Tubérculos'), ('C-302','C',302,'Tubérculos'),
  ('D-401','D',401,'Abarrotes')
on conflict (id) do nothing;
