"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirAdmin, supabaseServidor } from "@/lib/supabase-server";
import { BUCKET, esDelBucket } from "@/lib/urls";
import type { Foto, Seccion } from "@/lib/types";

/** Publica los cambios en el sitio al instante (la home es estática/ISR). */
const publicar = () => revalidatePath("/");

const txt = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
const SECCIONES: Seccion[] = ["portada", "espacios", "nosotros", "departamento"];

/** Borra archivos propios del bucket (las fotos iniciales en /public no se tocan). No frena la operación si falla. */
async function borrarArchivos(sb: Awaited<ReturnType<typeof supabaseServidor>>, paths: string[]) {
  const propios = paths.filter(esDelBucket);
  if (propios.length) {
    const { error } = await sb.storage.from(BUCKET).remove(propios);
    if (error) console.error("[storage] no se pudieron borrar archivos:", error.message);
  }
}

// ============================ Departamentos ============================

export interface EstadoForm { ok: boolean; mensaje: string }

export async function guardarDepartamento(_prev: EstadoForm | null, f: FormData): Promise<EstadoForm> {
  const { sb } = await requerirAdmin();
  const id = Number(f.get("id")) || null;
  const nombre = txt(f, "nombre", 80);
  const capacidad = Math.trunc(Number(f.get("capacidad")));
  const caracteristicas = [...new Set(
    txt(f, "caracteristicas", 2000).split("\n").map((c) => c.trim().slice(0, 80)).filter(Boolean),
  )].slice(0, 20);

  if (nombre.length < 2) return { ok: false, mensaje: "El nombre es obligatorio." };
  if (!(capacidad >= 1 && capacidad <= 30)) return { ok: false, mensaje: "La capacidad tiene que ser entre 1 y 30 personas." };

  const fila = {
    nombre, capacidad, caracteristicas,
    descripcion: txt(f, "descripcion", 2000),
    activo: f.get("activo") === "on",
    orden: Math.max(0, Math.min(999, Math.trunc(Number(f.get("orden")) || 0))),
  };

  if (id) {
    const { error } = await sb.from("departamentos").update(fila).eq("id", id);
    if (error) return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };
    publicar();
    return { ok: true, mensaje: "Cambios guardados y publicados." };
  }
  const { data, error } = await sb.from("departamentos").insert(fila).select("id").single();
  if (error) return { ok: false, mensaje: `No se pudo crear: ${error.message}` };
  publicar();
  redirect(`/admin/departamentos/${data.id}?nuevo=1`);
}

export async function alternarDepartamento(id: number, activo: boolean) {
  const { sb } = await requerirAdmin();
  const { error } = await sb.from("departamentos").update({ activo }).eq("id", id);
  if (error) throw new Error(error.message);
  publicar();
  revalidatePath("/admin/departamentos");
}

export async function eliminarDepartamento(f: FormData) {
  const { sb } = await requerirAdmin();
  const id = Number(f.get("id"));
  const { data: fotos } = await sb.from("fotos").select("path").eq("departamento_id", id);
  const { error } = await sb.from("departamentos").delete().eq("id", id); // las fotos se borran en cascada
  if (error) throw new Error(error.message);
  await borrarArchivos(sb, (fotos ?? []).map((x) => x.path));
  publicar();
  redirect("/admin/departamentos?aviso=eliminado");
}

// ================================ Fotos ================================

/** Registra fotos ya subidas al bucket desde el navegador. Devuelve las filas creadas (con id) en orden. */
export async function agregarFotos(seccion: Seccion, departamentoId: number | null, items: { path: string; alt: string }[]): Promise<Foto[]> {
  const { sb } = await requerirAdmin();
  if (!SECCIONES.includes(seccion)) throw new Error("Sección inválida");
  const depto = seccion === "departamento" ? Number(departamentoId) : null;
  if (seccion === "departamento" && !depto) throw new Error("Falta el departamento");

  // Las nuevas van al final de la galería.
  let q = sb.from("fotos").select("orden").eq("seccion", seccion).order("orden", { ascending: false }).limit(1);
  q = depto ? q.eq("departamento_id", depto) : q.is("departamento_id", null);
  const { data: ultima } = await q.maybeSingle();
  const base = (ultima?.orden ?? -1) + 1;

  const filas = items.slice(0, 30).map((it, i) => ({
    seccion, departamento_id: depto, path: String(it.path).slice(0, 400), alt: String(it.alt ?? "").trim().slice(0, 160), orden: base + i,
  }));
  const { data, error } = await sb.from("fotos").insert(filas).select("id,path,alt,orden");
  if (error) {
    await borrarArchivos(sb, filas.map((x) => x.path)); // no dejar archivos huérfanos
    throw new Error(error.message);
  }
  publicar();
  return (data as Foto[]).sort((a, b) => a.orden - b.orden);
}

/** Guarda el orden nuevo de una galería en una sola llamada (función ordenar_fotos en la base). */
export async function ordenarFotos(ids: number[]) {
  const { sb } = await requerirAdmin();
  const { error } = await sb.rpc("ordenar_fotos", { p_ids: ids.map(Number).filter(Boolean).slice(0, 200) });
  if (error) throw new Error(error.message);
  publicar();
}

export async function actualizarAlt(id: number, alt: string) {
  const { sb } = await requerirAdmin();
  const { error } = await sb.from("fotos").update({ alt: String(alt).trim().slice(0, 160) }).eq("id", id);
  if (error) throw new Error(error.message);
  publicar();
}

export async function eliminarFoto(id: number) {
  const { sb } = await requerirAdmin();
  const { data, error } = await sb.from("fotos").delete().eq("id", id).select("path").maybeSingle();
  if (error) throw new Error(error.message);
  if (data) await borrarArchivos(sb, [data.path]);
  publicar();
}

// ============================== Consultas ==============================

export async function marcarConsulta(f: FormData) {
  const { sb } = await requerirAdmin();
  await sb.from("consultas").update({ atendida: f.get("atendida") === "true" }).eq("id", Number(f.get("id")));
  revalidatePath("/admin", "layout");
}

export async function eliminarConsulta(f: FormData) {
  const { sb } = await requerirAdmin();
  await sb.from("consultas").delete().eq("id", Number(f.get("id")));
  revalidatePath("/admin", "layout");
}

// ================================ Sesión ===============================

export async function salir() {
  const sb = await supabaseServidor();
  await sb.auth.signOut();
  redirect("/admin/login");
}

// ============================== San José ==============================

/** Acepta "www.algo.com" o "algo.com/x" y lo completa con https://. Vacío = sin link. */
function normalizarLink(v: string): string | null | false {
  const t = v.trim();
  if (!t) return null;
  const url = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(url);
    return (u.protocol === "https:" || u.protocol === "http:") && u.hostname.includes(".") && !/\s/.test(url) ? u.href.slice(0, 500) : false;
  } catch { return false; }
}

export async function guardarTextosSanJose(_prev: EstadoForm | null, f: FormData): Promise<EstadoForm> {
  const { sb } = await requerirAdmin();
  const titulo = txt(f, "sanjose_titulo", 120);
  if (titulo.length < 2) return { ok: false, mensaje: "El título es obligatorio." };
  const { error } = await sb.from("textos_sitio").upsert([
    { clave: "sanjose_eyebrow", valor: txt(f, "sanjose_eyebrow", 60) },
    { clave: "sanjose_titulo", valor: titulo },
  ]);
  if (error) return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };
  publicar();
  return { ok: true, mensaje: "Encabezado guardado y publicado." };
}

export async function guardarAtractivo(_prev: EstadoForm | null, f: FormData): Promise<EstadoForm> {
  const { sb } = await requerirAdmin();
  const id = Number(f.get("id")) || null;
  const titulo = txt(f, "titulo", 80);
  const link = normalizarLink(txt(f, "link_url", 500));
  if (titulo.length < 2) return { ok: false, mensaje: "El título es obligatorio." };
  if (link === false) return { ok: false, mensaje: "El link no es una dirección web válida (ej.: https://www.termas.com.ar)." };

  const foto = txt(f, "foto", 400) || null;
  const fila = {
    titulo, foto, link_url: link,
    texto: txt(f, "texto", 600),
    link_texto: txt(f, "link_texto", 40),
    activo: f.get("activo") === "on",
  };

  if (id) {
    const { data: anterior } = await sb.from("atractivos").select("foto").eq("id", id).maybeSingle();
    const { error } = await sb.from("atractivos").update(fila).eq("id", id);
    if (error) return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };
    if (anterior?.foto && anterior.foto !== foto) await borrarArchivos(sb, [anterior.foto]); // foto reemplazada o quitada
    publicar();
    return { ok: true, mensaje: "Cambios guardados y publicados." };
  }
  const { data: ultimo } = await sb.from("atractivos").select("orden").order("orden", { ascending: false }).limit(1).maybeSingle();
  const { error } = await sb.from("atractivos").insert({ ...fila, orden: (ultimo?.orden ?? -1) + 1 });
  if (error) return { ok: false, mensaje: `No se pudo crear: ${error.message}` };
  publicar();
  redirect("/admin/san-jose?aviso=creado");
}

export async function alternarAtractivo(id: number, activo: boolean) {
  const { sb } = await requerirAdmin();
  const { error } = await sb.from("atractivos").update({ activo }).eq("id", id);
  if (error) throw new Error(error.message);
  publicar();
}

export async function ordenarAtractivos(ids: number[]) {
  const { sb } = await requerirAdmin();
  const { error } = await sb.rpc("ordenar_atractivos", { p_ids: ids.map(Number).filter(Boolean).slice(0, 100) });
  if (error) throw new Error(error.message);
  publicar();
}

export async function eliminarAtractivo(f: FormData) {
  const { sb } = await requerirAdmin();
  const { data, error } = await sb.from("atractivos").delete().eq("id", Number(f.get("id"))).select("foto").maybeSingle();
  if (error) throw new Error(error.message);
  if (data?.foto) await borrarArchivos(sb, [data.foto]);
  publicar();
  redirect("/admin/san-jose?aviso=eliminado");
}
