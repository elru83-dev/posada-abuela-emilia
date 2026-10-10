-- =====================================================================
-- Posada Abuela Emilia — esquema (Supabase / PostgreSQL)
-- Ejecutar completo en: Supabase > SQL Editor > New query > Run
-- Idempotente: se puede volver a correr sin romper nada.
-- =====================================================================

-- ---------- Departamentos ---------------------------------------------
create table if not exists public.departamentos (
  id               bigint generated always as identity primary key,
  nombre           text not null check (char_length(nombre) between 2 and 80),
  capacidad        smallint not null check (capacidad between 1 and 30),
  descripcion      text not null default '' check (char_length(descripcion) <= 2000),
  caracteristicas  text[] not null default '{}' check (cardinality(caracteristicas) <= 20),
  activo           boolean not null default true,
  orden            smallint not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists departamentos_activos_idx on public.departamentos (orden, id) where activo;

-- ---------- Fotos (de cada departamento y de las secciones del sitio) ----
-- seccion = 'departamento' exige departamento_id; las demás no lo llevan.
create table if not exists public.fotos (
  id               bigint generated always as identity primary key,
  seccion          text not null check (seccion in ('portada', 'espacios', 'nosotros', 'departamento')),
  departamento_id  bigint references public.departamentos(id) on delete cascade,
  path             text not null check (char_length(path) <= 400),
  alt              text not null default '' check (char_length(alt) <= 160),
  orden            smallint not null default 0,
  created_at       timestamptz not null default now(),
  constraint fotos_seccion_depto check ((seccion = 'departamento') = (departamento_id is not null))
);
-- Cubre la galería de un departamento y la de cada sección, ya ordenadas.
create index if not exists fotos_galeria_idx on public.fotos (seccion, departamento_id, orden, id);

-- ---------- Consultas de reserva ----------------------------------------
create table if not exists public.consultas (
  id               bigint generated always as identity primary key,
  nombre           text not null check (char_length(nombre) between 2 and 120),
  telefono         text not null check (char_length(telefono) between 6 and 30),
  departamento_id  bigint references public.departamentos(id) on delete set null,
  ingreso          date not null,
  egreso           date not null,
  personas         smallint not null check (personas between 1 and 30),
  mensaje          text check (char_length(mensaje) <= 2000),
  atendida         boolean not null default false,
  created_at       timestamptz not null default now(),
  constraint consultas_fechas check (egreso > ingreso)
);
create index if not exists consultas_recientes_idx on public.consultas (created_at desc);
create index if not exists consultas_pendientes_idx on public.consultas (created_at desc) where not atendida;

-- ---------- Administradores ---------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.es_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

-- ---------- Reordenar fotos en una sola llamada -------------------------
-- Recibe los ids en el orden nuevo; solo toca fotos de esa misma galería.
create or replace function public.ordenar_fotos(p_ids bigint[])
returns void
language plpgsql security invoker set search_path = ''
as $$
begin
  update public.fotos f
     set orden = o.pos
    from unnest(p_ids) with ordinality as o(id, pos)
   where f.id = o.id and f.orden is distinct from o.pos::smallint;
end $$;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.departamentos enable row level security;
alter table public.fotos         enable row level security;
alter table public.consultas     enable row level security;
alter table public.admins        enable row level security;

revoke all on public.departamentos, public.fotos, public.consultas, public.admins from anon, authenticated;
grant select on public.departamentos, public.fotos to anon, authenticated;
grant insert, update, delete on public.departamentos, public.fotos to authenticated;
grant insert (nombre, telefono, departamento_id, ingreso, egreso, personas, mensaje) on public.consultas to anon, authenticated;
grant select, delete, update (atendida) on public.consultas to authenticated;
grant execute on function public.es_admin() to anon, authenticated;
revoke execute on function public.ordenar_fotos(bigint[]) from public, anon;
grant execute on function public.ordenar_fotos(bigint[]) to authenticated;

-- Lectura pública (los departamentos ocultos solo los ve el admin)
drop policy if exists departamentos_lectura on public.departamentos;
create policy departamentos_lectura on public.departamentos
  for select to anon, authenticated using (activo or (select public.es_admin()));

drop policy if exists fotos_lectura on public.fotos;
create policy fotos_lectura on public.fotos
  for select to anon, authenticated using (true);

-- Escritura: solo admins
drop policy if exists departamentos_admin on public.departamentos;
create policy departamentos_admin on public.departamentos
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

drop policy if exists fotos_admin on public.fotos;
create policy fotos_admin on public.fotos
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

-- Consultas: cualquiera puede enviar una; solo admins leen, marcan y borran
drop policy if exists consultas_alta on public.consultas;
create policy consultas_alta on public.consultas
  for insert to anon, authenticated with check (not atendida and ingreso >= current_date - 1);

drop policy if exists consultas_admin_sel on public.consultas;
create policy consultas_admin_sel on public.consultas
  for select to authenticated using ((select public.es_admin()));

drop policy if exists consultas_admin_upd on public.consultas;
create policy consultas_admin_upd on public.consultas
  for update to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

drop policy if exists consultas_admin_del on public.consultas;
create policy consultas_admin_del on public.consultas
  for delete to authenticated using ((select public.es_admin()));

-- admins: sin políticas => nadie la lee por API (se gestiona desde Supabase)

-- =====================================================================
-- Storage: bucket público para las fotos
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do nothing;

drop policy if exists fotos_storage_admin on storage.objects;
create policy fotos_storage_admin on storage.objects
  for all to authenticated
  using (bucket_id = 'fotos' and (select public.es_admin()))
  with check (bucket_id = 'fotos' and (select public.es_admin()));
