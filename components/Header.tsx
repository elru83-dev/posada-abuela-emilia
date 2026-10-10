"use client";

import { useEffect, useRef, useState } from "react";

const LINKS = [["#departamentos", "Departamentos"], ["#espacios", "Espacios"], ["#nosotros", "Nosotros"], ["#ubicacion", "Ubicación"]] as const;

export function Header({ logo }: { logo: string }) {
  const [abierto, setAbierto] = useState(false);
  const [fijo, setFijo] = useState(false);
  const centinela = useRef<HTMLDivElement>(null);

  // Sombra al bajar: un IntersectionObserver en vez de escuchar cada scroll.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setFijo(!e.isIntersecting));
    io.observe(centinela.current!);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={centinela} className="centinela" aria-hidden="true" />
      <header className={`header${fijo ? " header--fijo" : ""}`}>
        <div className="contenedor header__fila">
          <a href="#inicio" className="marca" aria-label="Inicio">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo chico y fijo: sin optimizador */}
            <img src={logo} alt="Posada Abuela Emilia" width={677} height={201} className="marca__logo" />
          </a>
          <button className="menu-btn" type="button" aria-expanded={abierto} aria-controls="nav" aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setAbierto((v) => !v)}>
            <span /><span /><span />
          </button>
          <nav className={`nav${abierto ? " nav--abierta" : ""}`} id="nav" aria-label="Principal" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setAbierto(false); }}>
            {LINKS.map(([href, texto]) => <a key={href} href={href}>{texto}</a>)}
            <a href="#reservar" className="btn btn--chico">Consultar</a>
          </nav>
        </div>
      </header>
    </>
  );
}
