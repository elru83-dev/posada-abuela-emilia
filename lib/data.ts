import "server-only";
import { cache } from "react";
import { supabase, MODO_DEMO } from "./supabase";
import { DATOS_INICIALES, TEXTOS_POR_DEFECTO } from "./datos-iniciales";
import type { Atractivo, DatosSitio, Departamento, Foto, Seccion, TextosSitio } from "./types";

interface FilaFoto extends Foto { seccion: Seccion; departamento_id: number | null }

/**
 * Todo el sitio en 4 consultas en paralelo (departamentos activos, fotos, atractivos activos y textos),
 * agrupadas en memoria. La página es ISR: esto corre una vez por publicación, no por visita.
 */
export const getDatosSitio = cache(async (): Promise<DatosSitio> => {
  if (MODO_DEMO) return DATOS_INICIALES;

  const [deptos, fotos, atractivos, textos] = await Promise.all([
    supabase!.from("departamentos").select("id,nombre,capacidad,descripcion,caracteristicas,activo,orden").eq("activo", true).order("orden").order("id"),
    supabase!.from("fotos").select("id,path,alt,orden,seccion,departamento_id").order("orden").order("id"),
    supabase!.from("atractivos").select("id,titulo,texto,foto,link_url,link_texto,activo,orden").eq("activo", true).order("orden").order("id"),
    supabase!.from("textos_sitio").select("clave,valor"),
  ]);
  if (deptos.error) throw new Error(`[Supabase] departamentos: ${deptos.error.message}`);
  if (fotos.error) throw new Error(`[Supabase] fotos: ${fotos.error.message}`);

  // Si la migración de San José todavía no se corrió, la sección simplemente no aparece (el sitio no se cae).
  if (atractivos.error) console.error(`[Supabase] atractivos: ${atractivos.error.message}`);
  const tx: TextosSitio = { ...TEXTOS_POR_DEFECTO };
  for (const { clave, valor } of (textos.data ?? []) as { clave: string; valor: string }[]) {
    if (clave in tx && valor.trim()) tx[clave as keyof TextosSitio] = valor;
  }

  const porDepto = new Map<number, Foto[]>();
  const datos: DatosSitio = { departamentos: [], portada: [], espacios: [], nosotros: [], atractivos: (atractivos.data ?? []) as Atractivo[], textos: tx };
  for (const { seccion, departamento_id, ...foto } of fotos.data as FilaFoto[]) {
    if (seccion === "departamento") {
      const lista = porDepto.get(departamento_id!);
      if (lista) lista.push(foto); else porDepto.set(departamento_id!, [foto]);
    } else datos[seccion].push(foto);
  }
  datos.departamentos = (deptos.data as Omit<Departamento, "fotos">[]).map((d) => ({ ...d, fotos: porDepto.get(d.id) ?? [] }));
  return datos;
});
