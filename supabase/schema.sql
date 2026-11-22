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

-- Permisos de la Data API: solo el backend (service_role). anon/authenticated sin acceso.
-- (En proyectos nuevos de Supabase las tablas creadas por SQL no se exponen automáticamente.)
grant usage on schema public to service_role;
grant select, insert, update, delete on public.comerciantes, public.puestos, public.denuncias to service_role;
revoke all on public.comerciantes, public.puestos, public.denuncias from anon, authenticated;

-- MORD-35: Libro de Reclamaciones virtual (Ley 29571, D.S. 011-2011-PCM y modificatorias).
create table if not exists public.reclamos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  tipo text not null check (tipo in ('Reclamo','Queja')),
  nombres text not null,
  documento text not null,
  domicilio text not null,
  email text not null,
  telefono text,
  apoderado text,
  bien_tipo text not null check (bien_tipo in ('Producto','Servicio')),
  monto numeric(12,2),
  descripcion_bien text not null,
  detalle text not null,
  pedido text not null,
  estado text not null default 'Recibido',
  creado_en timestamptz not null default now()
);
alter table public.reclamos enable row level security;
grant select, insert, update, delete on public.reclamos to service_role;
revoke all on public.reclamos from anon, authenticated;

-- MORD-36: ciclo de vida de la licencia y reportes ciudadanos de faltas.
alter table public.comerciantes
  add column if not exists licencia_estado text not null default 'Vigente'
    check (licencia_estado in ('Vigente','En revisión','Suspendida','Revocada')),
  add column if not exists licencia_motivo text;
create table if not exists public.reportes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  codigo_licencia text not null,
  categoria text not null,
  descripcion text not null,
  estado text not null default 'Nuevo' check (estado in ('Nuevo','Atendido')),
  creado_en timestamptz not null default now()
);
alter table public.reportes enable row level security;
grant select, insert, update, delete on public.reportes to service_role;
revoke all on public.reportes from anon, authenticated;
