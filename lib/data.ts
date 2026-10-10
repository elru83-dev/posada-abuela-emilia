import "server-only";
import { cache } from "react";
import { supabase, MODO_DEMO } from "./supabase";
import { DATOS_INICIALES } from "./datos-iniciales";
import type { DatosSitio, Departamento, Foto, Seccion } from "./types";

interface FilaFoto extends Foto { seccion: Seccion; departamento_id: number | null }

/**
 * Todo el sitio en 2 consultas en paralelo (departamentos activos + todas las fotos),
 * agrupadas en memoria. La página es ISR: esto corre una vez por publicación, no por visita.
 */
export const getDatosSitio = cache(async (): Promise<DatosSitio> => {
  if (MODO_DEMO) return DATOS_INICIALES;

  const [deptos, fotos] = await Promise.all([
    supabase!.from("departamentos").select("id,nombre,capacidad,descripcion,caracteristicas,activo,orden").eq("activo", true).order("orden").order("id"),
    supabase!.from("fotos").select("id,path,alt,orden,seccion,departamento_id").order("orden").order("id"),
  ]);
  if (deptos.error) throw new Error(`[Supabase] departamentos: ${deptos.error.message}`);
  if (fotos.error) throw new Error(`[Supabase] fotos: ${fotos.error.message}`);

  const porDepto = new Map<number, Foto[]>();
  const datos: DatosSitio = { departamentos: [], portada: [], espacios: [], nosotros: [] };
  for (const { seccion, departamento_id, ...foto } of fotos.data as FilaFoto[]) {
    if (seccion === "departamento") {
      const lista = porDepto.get(departamento_id!);
      if (lista) lista.push(foto); else porDepto.set(departamento_id!, [foto]);
    } else datos[seccion].push(foto);
  }
  datos.departamentos = (deptos.data as Omit<Departamento, "fotos">[]).map((d) => ({ ...d, fotos: porDepto.get(d.id) ?? [] }));
  return datos;
});
