"use client";

import { useRef, useState } from "react";
import { comprimirImagen } from "@/lib/imagen";
import { supabaseNavegador } from "@/lib/supabase-browser";
import { BUCKET, esDelBucket, urlImagen } from "@/lib/urls";

/**
 * Una sola foto para un formulario: la sube comprimida a Storage y deja la ruta en un input oculto (name).
 * Si se reemplaza una foto subida en esta misma edición (todavía sin guardar), borra esa del bucket para no dejar huérfanas.
 * La foto que ya estaba guardada la borra el servidor recién al guardar el formulario.
 */
export function FotoUnica({ name, inicial, carpeta }: { name: string; inicial: string | null; carpeta: string }) {
  const [path, setPath] = useState(inicial ?? "");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function descartarTemporal(p: string) {
    if (p && p !== inicial && esDelBucket(p)) await supabaseNavegador().storage.from(BUCKET).remove([p]);
  }

  async function subir(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setError(""); setSubiendo(true);
    try {
      const { blob, ext } = await comprimirImagen(file);
      const nuevo = `${carpeta}/${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      const { error } = await supabaseNavegador().storage.from(BUCKET).upload(nuevo, blob, { contentType: blob.type, cacheControl: "31536000" });
      if (error) throw error;
      await descartarTemporal(path);
      setPath(nuevo);
    } catch (e) {
      setError(`No se pudo subir la foto: ${(e as Error).message}`);
    } finally {
      setSubiendo(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="fu">
      <input type="hidden" name={name} value={path} />
      <div className="fu__vista">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {path ? <img src={urlImagen(path)} alt="" /> : <span>Sin foto</span>}
      </div>
      <div className="fu__acciones">
        <label className={`btn btn--borde btn--chico${subiendo ? " fu__ocupado" : ""}`}>
          <input ref={input} type="file" accept="image/*" hidden disabled={subiendo} onChange={(e) => subir(e.target.files?.[0])} />
          {subiendo ? "Subiendo…" : path ? "Cambiar foto" : "Subir foto"}
        </label>
        {path && !subiendo && (
          <button type="button" className="adm-link-peligro" onClick={() => { descartarTemporal(path); setPath(""); }}>Quitar foto</button>
        )}
      </div>
      {error && <p className="adm-error" role="alert">{error}</p>}
      <p className="adm-ayuda">Los cambios de foto se aplican al tocar “Guardar”.</p>
    </div>
  );
}
