"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { urlImagen } from "@/lib/urls";
import type { Atractivo } from "@/lib/types";
import { alternarAtractivo, ordenarAtractivos } from "../../acciones";

/** Lista con orden (flechas) y visible/oculto; los cambios se guardan al instante, con vuelta atrás si fallan. */
export function ListaAtractivos({ iniciales }: { iniciales: Atractivo[] }) {
  const [lista, setLista] = useState(iniciales);
  const [error, setError] = useState("");
  const [, iniciar] = useTransition();

  function aplicar(nueva: Atractivo[], guardar: () => Promise<void>) {
    const anterior = lista;
    setLista(nueva); setError("");
    iniciar(async () => { try { await guardar(); } catch (e) { setLista(anterior); setError((e as Error).message); } });
  }
  const mover = (i: number, paso: number) => {
    const j = i + paso;
    if (j < 0 || j >= lista.length) return;
    const n = [...lista]; [n[i], n[j]] = [n[j], n[i]];
    aplicar(n, () => ordenarAtractivos(n.map((a) => a.id)));
  };
  const alternar = (a: Atractivo) =>
    aplicar(lista.map((x) => (x.id === a.id ? { ...x, activo: !x.activo } : x)), () => alternarAtractivo(a.id, !a.activo));

  if (!lista.length) return <p className="adm-bloque">Todavía no hay tarjetas. Creá la primera con el botón de arriba.</p>;
  return (
    <>
      {error && <p className="adm-error" role="alert">No se pudo guardar: {error}</p>}
      <ol className="adm-atr">
        {lista.map((a, i) => (
          <li key={a.id} className={`adm-atr__item${a.activo ? "" : " adm-atr__item--oculto"}`}>
            <div className="adm-atr__orden">
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label={`Subir ${a.titulo}`}>↑</button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === lista.length - 1} aria-label={`Bajar ${a.titulo}`}>↓</button>
            </div>
            <Link href={`/admin/san-jose/${a.id}`} className="adm-depto__link">
              <span className="adm-depto__img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {a.foto ? <img src={urlImagen(a.foto)} alt="" loading="lazy" /> : <span>Sin foto</span>}
              </span>
              <span className="adm-depto__datos">
                <b>{a.titulo}</b>
                <span>{a.link_url ? `Link: ${new URL(a.link_url).hostname}` : "Sin link"}</span>
              </span>
            </Link>
            <button type="button" className={`adm-switch${a.activo ? " adm-switch--on" : ""}`} aria-pressed={a.activo} onClick={() => alternar(a)}>
              {a.activo ? "Visible" : "Oculta"}
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}
