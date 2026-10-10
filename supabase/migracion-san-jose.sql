-- =====================================================================
-- Sección "¿Por qué San José?" administrable desde el panel.
-- Correr UNA vez en Supabase > SQL Editor (si ya corriste schema.sql antes).
-- Idempotente: se puede volver a correr sin duplicar nada.
-- =====================================================================

-- Tarjetas de la sección (atractivos de la zona)
create table if not exists public.atractivos (
  id          bigint generated always as identity primary key,
  titulo      text not null check (char_length(titulo) between 2 and 80),
  texto       text not null default '' check (char_length(texto) <= 600),
  foto        text check (char_length(foto) <= 400),
  link_url    text check (link_url is null or (link_url ~* '^https?://[^\s]+$' and char_length(link_url) <= 500)),
  link_texto  text not null default '' check (char_length(link_texto) <= 40),
  activo      boolean not null default true,
  orden       smallint not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists atractivos_activos_idx on public.atractivos (orden, id) where activo;

-- Textos sueltos del sitio editables (por ahora: encabezado de la sección San José)
create table if not exists public.textos_sitio (
  clave  text primary key check (clave ~ '^[a-z0-9_]+$'),
  valor  text not null default '' check (char_length(valor) <= 300)
);

-- Reordenar tarjetas en una sola llamada (RLS del que llama: solo admins pueden actualizar)
create or replace function public.ordenar_atractivos(p_ids bigint[])
returns void
language plpgsql security invoker set search_path = ''
as $$
begin
  update public.atractivos a
     set orden = o.pos
    from unnest(p_ids) with ordinality as o(id, pos)
   where a.id = o.id and a.orden is distinct from o.pos::smallint;
end $$;

alter table public.atractivos   enable row level security;
alter table public.textos_sitio enable row level security;

revoke all on public.atractivos, public.textos_sitio from anon, authenticated;
grant select on public.atractivos, public.textos_sitio to anon, authenticated;
grant insert, update, delete on public.atractivos, public.textos_sitio to authenticated;
revoke execute on function public.ordenar_atractivos(bigint[]) from public, anon;
grant execute on function public.ordenar_atractivos(bigint[]) to authenticated;

drop policy if exists atractivos_lectura on public.atractivos;
create policy atractivos_lectura on public.atractivos
  for select to anon, authenticated using (activo or (select public.es_admin()));
drop policy if exists atractivos_admin on public.atractivos;
create policy atractivos_admin on public.atractivos
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

drop policy if exists textos_lectura on public.textos_sitio;
create policy textos_lectura on public.textos_sitio
  for select to anon, authenticated using (true);
drop policy if exists textos_admin on public.textos_sitio;
create policy textos_admin on public.textos_sitio
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

-- Contenido inicial (solo si la tabla está vacía)
insert into public.textos_sitio (clave, valor) values
  ('sanjose_eyebrow', '¿Por qué San José?'),
  ('sanjose_titulo', 'Termas, historia y tradición')
on conflict (clave) do nothing;

insert into public.atractivos (titulo, texto, foto, orden)
select * from (values
  ('Termas de San José', 'Piletas termales para relajarse todo el año, a pocos minutos de la posada.', '/img/termas-san-jose.webp', 0),
  ('Molino Forclaz', 'El histórico molino de viento de los colonos, hoy museo, símbolo de la colonia fundada por inmigrantes europeos.', '/img/molino-forclaz.webp', 1),
  ('Paseo del Mate', 'Un recorrido dedicado a la tradición del mate, para conocer la cultura de la región.', '/img/paseo-del-mate.webp', 2)
) as v(titulo, texto, foto, orden)
where not exists (select 1 from public.atractivos);
