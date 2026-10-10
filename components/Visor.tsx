"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export interface FotoVisor { src: string; alt: string }

interface Props {
  /** Galerías por clave ("depto-3", "espacios"…). */
  galerias: Record<string, FotoVisor[]>;
  titulos: Record<string, string>;
  /** Contenido renderizado en el servidor; cualquier elemento con data-galeria (y data-i opcional) abre el visor. */
  children: ReactNode;
}

/**
 * Visor de fotos a pantalla completa con carrusel.
 * <dialog> nativo (foco atrapado y Esc) + scroll-snap (deslizar con el dedo es el nativo del navegador).
 * No monta nada hasta el primer click.
 */
export function Visor({ galerias, titulos, children }: Props) {
  const [abierta, setAbierta] = useState<{ clave: string; i: number } | null>(null);
  const [actual, setActual] = useState(0);
  const dialogo = useRef<HTMLDialogElement>(null);
  const pista = useRef<HTMLDivElement>(null);
  const tira = useRef<HTMLDivElement>(null);
  const fotos = abierta ? galerias[abierta.clave] ?? [] : [];
  const total = fotos.length;

  const ir = useCallback((i: number, suave = true) => {
    const el = pista.current;
    if (!el || !total) return;
    el.scrollTo({ left: ((i + total) % total) * el.clientWidth, behavior: suave ? "smooth" : "instant" });
  }, [total]);

  useEffect(() => {
    if (!abierta) return;
    const d = dialogo.current!;
    if (!d.open) d.showModal();
    setActual(abierta.i);
    ir(abierta.i, false);
    const raiz = document.documentElement;
    raiz.classList.add("sin-scroll");
    return () => raiz.classList.remove("sin-scroll");
  }, [abierta, ir]);

  useEffect(() => {
    if (abierta) tira.current?.children[actual]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [actual, abierta]);

  const alClick = (e: React.MouseEvent) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("[data-galeria]");
    if (b && galerias[b.dataset.galeria!]?.length) setAbierta({ clave: b.dataset.galeria!, i: Number(b.dataset.i ?? 0) });
  };

  const alScroll = () => {
    const el = pista.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== actual) setActual(i);
  };

  const varias = total > 1;
  const cerrar = () => dialogo.current?.close();

  return (
    <>
      <div onClick={alClick} style={{ display: "contents" }}>{children}</div>

      {abierta && (
        <dialog ref={dialogo} className="visor" aria-label={titulos[abierta.clave] ?? "Fotos"} onClose={() => setAbierta(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); ir(actual + 1); }
            else if (e.key === "ArrowLeft") { e.preventDefault(); ir(actual - 1); }
          }}
          onClick={(e) => { const t = e.target as HTMLElement; if (t === e.currentTarget || t.classList.contains("visor__slide")) cerrar(); }}>
          <div className="visor__barra">
            {varias && <span className="visor__contador" aria-live="polite">{actual + 1} / {total}</span>}
            <span className="visor__titulo">{titulos[abierta.clave]}</span>
            <button type="button" className="visor__btn" onClick={cerrar} aria-label="Cerrar" autoFocus>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
            </button>
          </div>

          <div className="visor__pista" ref={pista} onScroll={alScroll}>
            {fotos.map((f, i) => (
              <div className="visor__slide" key={f.src} aria-hidden={i !== actual}>
                <div className="visor__marco">
                  <Image src={f.src} alt={f.alt} fill sizes="100vw" style={{ objectFit: "contain" }} loading={Math.abs(i - actual) <= 1 ? "eager" : "lazy"} />
                </div>
              </div>
            ))}
          </div>

          {varias && (
            <>
              <button type="button" className="visor__btn visor__flecha visor__flecha--ant" onClick={() => ir(actual - 1)} aria-label="Foto anterior">
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" className="visor__btn visor__flecha visor__flecha--sig" onClick={() => ir(actual + 1)} aria-label="Foto siguiente">
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <div className="visor__tira" ref={tira}>
                {fotos.map((f, i) => (
                  <button type="button" key={f.src} className="visor__mini" aria-current={i === actual} aria-label={`Ver foto ${i + 1}`} onClick={() => ir(i)}>
                    <Image src={f.src} alt="" fill sizes="72px" style={{ objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            </>
          )}
        </dialog>
      )}
    </>
  );
}
