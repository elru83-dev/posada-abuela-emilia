-- OPCIONAL: agrega al final de A y B las fotos 2026 bajadas con descargar-imagenes.ps1.
-- Correr una sola vez, después de seed.sql y de subir las fotos (public/img) al repo.
insert into public.fotos (seccion, departamento_id, path, alt, orden)
select 'departamento', d.id, v.path, d.nombre, 100 + v.n
from (values
  ('Departamento A', '/img/a2-1024x768.webp', 0),
  ('Departamento A', '/img/a-768x1024.webp', 1),
  ('Departamento A', '/img/a3-768x1024.webp', 2),
  ('Departamento A', '/img/a4-1024x768.webp', 3),
  ('Departamento A', '/img/a5-768x1024.webp', 4),
  ('Departamento A', '/img/a6-768x1024.webp', 5),
  ('Departamento A', '/img/a7-768x1024.webp', 6),
  ('Departamento A', '/img/a8-1024x768.webp', 7),
  ('Departamento B', '/img/b-576x1024.webp', 0),
  ('Departamento B', '/img/b2-576x1024.webp', 1),
  ('Departamento B', '/img/b3-576x1024.webp', 2),
  ('Departamento B', '/img/b4-576x1024.webp', 3),
  ('Departamento B', '/img/b5-576x1024.webp', 4)
) as v(depto, path, n)
join public.departamentos d on d.nombre = v.depto
where not exists (select 1 from public.fotos f where f.path = v.path);
