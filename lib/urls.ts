export const BUCKET = "fotos";

/**
 * Ruta guardada en la base → URL pública.
 * - "/img/..."  → archivo dentro de /public (fotos iniciales migradas del sitio viejo)
 * - "https://…" → se usa tal cual
 * - otra cosa   → archivo del bucket de Supabase Storage
 */
export function urlImagen(path: string): string {
  if (path.startsWith("/") || /^https?:\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** true si la foto vive en el bucket (y por lo tanto se puede borrar el archivo). */
export const esDelBucket = (path: string) => !path.startsWith("/") && !/^https?:\/\//.test(path);
