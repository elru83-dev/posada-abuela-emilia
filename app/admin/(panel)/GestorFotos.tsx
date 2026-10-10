"use client";

import { useRef, useState, useTransition } from "react";
import { comprimirImagen } from "@/lib/imagen";
import { supabaseNavegador } from "@/lib/supabase-browser";
import { BUCKET, urlImagen } from "@/lib/urls";
import type { Foto, Seccion } from "@/lib/types";
import { agregarFotos, actualizarAlt, eliminarFoto, ordenarFotos } from "../acciones";

interface Props {
  seccion: Seccion;
  departamentoId?: number | null;
  fotosIniciales: Foto[];
  /** Texto por defecto de cada foto nueva (ej. el nombre del departamento). */
  altPorDefecto?: string;
  max?: number;
}

const PARALELO = 3; // subidas simultáneas: rápido sin saturar el celular

/**
 * Administra una galería: subir varias fotos (se comprimen a WebP en el navegador y van directo a Storage),
 * ordenar, elegir portada, editar la descripción y borrar. Cada cambio se guarda y publica al instante.
 */
export function GestorFotos({ seccion, departamentoId = null, fotosIniciales, altPorDefecto = "", max = 30 }: Props) {
  const [fotos, setFotos] = useState(fotosIniciales);
  const [subiendo, setSubiendo] = useState<{ hechas: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [arrastrando, setArrastrando] = useState(false);
  const [pendiente, iniciar] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const lugar = max - fotos.length;

  async function subir(lista: FileList | File[]) {
    setError("");
    const archivos = Array.from(lista).filter((f) => f.type.startsWith("image/")).slice(0, Math.max(0, lugar));
    if (!archivos.length) { if (lugar <= 0) setError(`Máximo ${max} fotos en esta galería.`); return; }

    const sb = supabaseNavegador();
    const carpeta = seccion === "departamento" ? `departamentos/${departamentoId}` : seccion;
    const subidas: { path: string; alt: string; i: number }[] = [];
    const fallidas: string[] = [];
    let hechas = 0;
    setSubiendo({ hechas, total: archivos.length });

    // Cola con concurrencia limitada; conserva el orden en que se eligieron.
    let siguiente = 0;
    const trabajador = async () => {
      while (siguiente < archivos.length) {
        const i = siguiente++;
        const file = archivos[i];
        try {
          const { blob, ext } = await comprimirImagen(file);
          const path = `${carpeta}/${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
          const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
          if (error) throw error;
          subidas.push({ path, alt: altPorDefecto, i });
        } catch {
          fallidas.push(file.name);
        }
        setSubiendo({ hechas: ++hechas, total: archivos.length });
      }
    };
    await Promise.all(Array.from({ length: Math.min(PARALELO, archivos.length) }, trabajador));

    if (subidas.length) {
      try {
        const nuevas = await agregarFotos(seccion, departamentoId, subidas.sort((a, b) => a.i - b.i).map(({ path, alt }) => ({ path, alt })));
        setFotos((f) => [...f, ...nuevas]);
      } catch (e) {
        setError(`No se pudieron guardar las fotos: ${(e as Error).message}`);
      }
    }
    if (fallidas.length) setError(`No se pudieron subir: ${fallidas.join(", ")}. Probá de nuevo.`);
    setSubiendo(null);
    if (input.current) input.current.value = "";
  }

  /** Aplica un orden nuevo al instante y lo guarda; si falla, vuelve atrás. */
  function reordenar(nuevo: Foto[]) {
    const anterior = fotos;
    setFotos(nuevo);
    iniciar(async () => {
      try { await ordenarFotos(nuevo.map((f) => f.id)); }
      catch (e) { setFotos(anterior); setError(`No se pudo ordenar: ${(e as Error).message}`); }
    });
  }
  const mover = (i: number, paso: number) => {
    const j = i + paso;
    if (j < 0 || j >= fotos.length) return;
    const n = [...fotos];
    [n[i], n[j]] = [n[j], n[i]];
    reordenar(n);
  };
  const hacerPortada = (i: number) => reordenar([fotos[i], ...fotos.filter((_, k) => k !== i)]);

  function borrar(foto: Foto) {
    if (!confirm("¿Eliminar esta foto? No se puede deshacer.")) return;
    const anterior = fotos;
    setFotos((f) => f.filter((x) => x.id !== foto.id));
    iniciar(async () => {
      try { await eliminarFoto(foto.id); }
      catch (e) { setFotos(anterior); setError(`No se pudo eliminar: ${(e as Error).message}`); }
    });
  }

  function guardarAlt(foto: Foto, alt: string) {
    if (alt.trim() === foto.alt) return;
    setFotos((f) => f.map((x) => (x.id === foto.id ? { ...x, alt: alt.trim() } : x)));
    iniciar(async () => {
      try { await actualizarAlt(foto.id, alt); }
      catch (e) { setError(`No se pudo guardar la descripción: ${(e as Error).message}`); }
    });
  }

  return (
    <div className="gf">
      {error && <p className="adm-error" role="alert">{error}</p>}

      {fotos.length > 0 && (
        <ol className="gf__grilla">
          {fotos.map((f, i) => (
            <li key={f.id} className="gf__foto">
              <div className="gf__img">
                {/* eslint-disable-next-line @next/next/no-img-element -- miniatura del panel, sin pasar por el optimizador */}
                <img src={urlImagen(f.path)} alt={f.alt} loading="lazy" decoding="async" />
                {i === 0 && <span className="gf__portada">Portada</span>}
                <span className="gf__num">{i + 1}</span>
              </div>
              <input className="gf__alt" defaultValue={f.alt} maxLength={160} placeholder="Descripción (opcional)" aria-label={`Descripción de la foto ${i + 1}`}
                onBlur={(e) => guardarAlt(f, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
              <div className="gf__acciones">
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Mover antes" title="Mover antes">←</button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === fotos.length - 1} aria-label="Mover después" title="Mover después">→</button>
                {i > 0 && <button type="button" onClick={() => hacerPortada(i)} title="Usar como portada" aria-label="Usar como portada">★<span className="gf__txt"> Portada</span></button>}
                <button type="button" className="gf__borrar" onClick={() => borrar(f)} aria-label="Eliminar foto" title="Eliminar">✕<span className="gf__txt"> Eliminar</span></button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {lugar > 0 && (
        <label className={`gf__subir${arrastrando ? " gf__subir--sobre" : ""}${subiendo ? " gf__subir--ocupado" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }} onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => { e.preventDefault(); setArrastrando(false); if (!subiendo) subir(e.dataTransfer.files); }}>
          <input ref={input} type="file" accept="image/*" multiple hidden disabled={!!subiendo} onChange={(e) => e.target.files && subir(e.target.files)} />
          {subiendo ? (
            <>
              <b>Subiendo {subiendo.hechas} de {subiendo.total}…</b>
              <progress max={subiendo.total} value={subiendo.hechas} />
            </>
          ) : (
            <>
              <b>+ Agregar fotos</b>
              <span>Tocá para elegir (podés seleccionar varias) o arrastralas acá. Se achican solas antes de subir.</span>
            </>
          )}
        </label>
      )}
      <p className="adm-ayuda">{fotos.length} de {max} fotos{pendiente ? " · guardando…" : ""}</p>
    </div>
  );
}
