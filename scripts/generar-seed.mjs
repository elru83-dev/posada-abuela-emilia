// Genera supabase/seed.sql desde lib/datos-iniciales.ts  →  node --experimental-strip-types scripts/generar-seed.mjs
import { writeFileSync } from "node:fs";
const { DATOS_INICIALES: D } = await import("../lib/datos-iniciales.ts");
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const arr = (a) => `array[${a.map(q).join(", ")}]::text[]`;
let sql = `-- Contenido inicial (departamentos y fotos migradas del sitio anterior).
-- Correr UNA vez, después de schema.sql. Si ya hay departamentos cargados no hace nada.
do $$
begin
  if exists (select 1 from public.departamentos) then
    raise notice 'Ya hay departamentos: no se cargó nada.';
    return;
  end if;

  insert into public.departamentos (nombre, capacidad, descripcion, caracteristicas, activo, orden) values
${D.departamentos.map((d) => `    (${q(d.nombre)}, ${d.capacidad}, ${q(d.descripcion)}, ${arr(d.caracteristicas)}, ${d.activo}, ${d.orden})`).join(",\n")};

  insert into public.fotos (seccion, departamento_id, path, alt, orden)
  select 'departamento', d.id, v.path, v.alt, v.orden
  from (values
${D.departamentos.flatMap((d) => d.fotos.map((f, i) => `    (${q(d.nombre)}, ${q(f.path)}, ${q(f.alt)}, ${i})`)).join(",\n")}
  ) as v(depto, path, alt, orden)
  join public.departamentos d on d.nombre = v.depto;

  insert into public.fotos (seccion, path, alt, orden) values
${["portada", "espacios", "nosotros"].flatMap((s) => D[s].map((f, i) => `    (${q(s)}, ${q(f.path)}, ${q(f.alt)}, ${i})`)).join(",\n")};
end $$;
`;
sql += `
-- Sección "¿Por qué San José?"
insert into public.textos_sitio (clave, valor) values
${Object.entries(D.textos).map(([k, v]) => `  (${q(k)}, ${q(v)})`).join(",\n")}
on conflict (clave) do nothing;

insert into public.atractivos (titulo, texto, foto, link_url, link_texto, orden)
select * from (values
${D.atractivos.map((a, i) => `  (${q(a.titulo)}, ${q(a.texto)}, ${a.foto ? q(a.foto) : "null"}, ${a.link_url ? q(a.link_url) : "null::text"}, ${q(a.link_texto)}, ${i})`).join(",\n")}
) as v(titulo, texto, foto, link_url, link_texto, orden)
where not exists (select 1 from public.atractivos);
`;
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);

// Fotos 2026 de A y B (opcional: requiere haber corrido descargar-imagenes.ps1 y subido public/img).
const extra = { "Departamento A": ["a2-1024x768", "a-768x1024", "a3-768x1024", "a4-1024x768", "a5-768x1024", "a6-768x1024", "a7-768x1024", "a8-1024x768"],
                "Departamento B": ["b-576x1024", "b2-576x1024", "b3-576x1024", "b4-576x1024", "b5-576x1024"] };
writeFileSync(new URL("../supabase/seed-fotos-2026.sql", import.meta.url), `-- OPCIONAL: agrega al final de A y B las fotos 2026 bajadas con descargar-imagenes.ps1.
-- Correr una sola vez, después de seed.sql y de subir las fotos (public/img) al repo.
insert into public.fotos (seccion, departamento_id, path, alt, orden)
select 'departamento', d.id, v.path, d.nombre, 100 + v.n
from (values
${Object.entries(extra).flatMap(([dep, fs]) => fs.map((x, i) => `  (${q(dep)}, ${q(`/img/${x}.webp`)}, ${i})`)).join(",\n")}
) as v(depto, path, n)
join public.departamentos d on d.nombre = v.depto
where not exists (select 1 from public.fotos f where f.path = v.path);
`);
console.log("seed.sql generado");
