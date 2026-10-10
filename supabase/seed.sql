-- Contenido inicial (departamentos y fotos migradas del sitio anterior).
-- Correr UNA vez, después de schema.sql. Si ya hay departamentos cargados no hace nada.
do $$
begin
  if exists (select 1 from public.departamentos) then
    raise notice 'Ya hay departamentos: no se cargó nada.';
    return;
  end if;

  insert into public.departamentos (nombre, capacidad, descripcion, caracteristicas, activo, orden) values
    ('Departamento A', 7, '', array['Cocina equipada', 'WiFi y Smart TV', 'Cochera privada']::text[], true, 1),
    ('Departamento B', 6, '', array['Cocina equipada', 'WiFi y Smart TV', 'Cochera privada']::text[], true, 2),
    ('Departamento C', 5, '', array['Cocina equipada', 'WiFi y Smart TV', 'Cochera privada']::text[], true, 3),
    ('Departamento D', 6, '', array['Cocina equipada', 'WiFi y Smart TV', 'Cochera privada']::text[], true, 4),
    ('Departamento E', 4, '', array['Cocina equipada', 'WiFi y Smart TV', 'Cochera privada']::text[], true, 5),
    ('Departamento F', 3, '', array['Cocina equipada', 'WiFi y Smart TV', 'Cochera privada']::text[], true, 6);

  insert into public.fotos (seccion, departamento_id, path, alt, orden)
  select 'departamento', d.id, v.path, v.alt, v.orden
  from (values
    ('Departamento A', '/img/depto-a-1.webp', 'Departamento A', 0),
    ('Departamento A', '/img/depto-a-2.webp', 'Departamento A – cocina y comedor', 1),
    ('Departamento A', '/img/depto-a-bano.webp', 'Departamento A – baño', 2),
    ('Departamento B', '/img/depto-b-1.webp', 'Departamento B', 0),
    ('Departamento B', '/img/depto-b-2.webp', 'Departamento B – cocina', 1),
    ('Departamento B', '/img/depto-b-bano.webp', 'Departamento B – baño', 2),
    ('Departamento C', '/img/depto-c-1.webp', 'Departamento C – cocina y comedor', 0),
    ('Departamento C', '/img/depto-c-2.webp', 'Departamento C – dormitorio', 1),
    ('Departamento C', '/img/depto-c-bano.webp', 'Departamento C – baño', 2),
    ('Departamento D', '/img/depto-d-1.webp', 'Departamento D', 0),
    ('Departamento E', '/img/depto-e-1.webp', 'Departamento E', 0),
    ('Departamento F', '/img/depto-f-1.webp', 'Departamento F', 0),
    ('Departamento F', '/img/depto-f-bano.webp', 'Departamento F – baño', 1)
  ) as v(depto, path, alt, orden)
  join public.departamentos d on d.nombre = v.depto;

  insert into public.fotos (seccion, path, alt, orden) values
    ('portada', '/img/portada-frente.webp', 'Frente de la Posada Abuela Emilia', 0),
    ('espacios', '/img/sum.webp', 'SUM', 0),
    ('espacios', '/img/sum-ping-pong.webp', 'SUM con mesa de ping pong', 1),
    ('espacios', '/img/sum-metegol.webp', 'SUM con metegol', 2),
    ('espacios', '/img/quincho.webp', 'Quincho', 3),
    ('espacios', '/img/patio-hamaca.webp', 'Patio con hamaca paraguaya', 4),
    ('espacios', '/img/patio-jardin.webp', 'Patio', 5),
    ('espacios', '/img/jardin.webp', 'Jardín', 6),
    ('espacios', '/img/camino-entrada.webp', 'Camino de entrada', 7),
    ('espacios', '/img/cochera.webp', 'Cochera', 8),
    ('espacios', '/img/cartel-entrada.webp', 'Entrada de la posada', 9),
    ('nosotros', '/img/susana-y-daniel.webp', 'Susana y Daniel, dueños de la posada', 0),
    ('nosotros', '/img/susana-y-daniel-homologado.webp', 'Susana y Daniel con el certificado de alojamiento homologado', 1);
end $$;
