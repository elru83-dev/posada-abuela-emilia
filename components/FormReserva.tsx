"use client";

import { useEffect, useMemo, useState } from "react";
import { registrarConsulta } from "@/app/acciones";

interface Depto { id: number; nombre: string; capacidad: number }
interface Props { deptos: Depto[]; whatsapp: string; nochesMinimas: number }

const DIA = 864e5;
const hoy = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const sumar = (iso: string, n: number) => new Date(Date.parse(iso) + n * DIA).toISOString().slice(0, 10);
const fecha = (iso: string) => iso.split("-").reverse().join("/");

/**
 * Valida en el navegador, abre WhatsApp en el mismo click (si se abre después de un await, el navegador lo bloquea como popup)
 * y en paralelo guarda la consulta en la base para que quede registrada en el panel.
 */
export function FormReserva({ deptos, whatsapp, nochesMinimas }: Props) {
  const [depto, setDepto] = useState("");
  const [ingreso, setIngreso] = useState("");
  const [egreso, setEgreso] = useState("");
  const [error, setError] = useState("");
  const [estado, setEstado] = useState<"" | "enviando" | "ok">("");
  const capMax = Math.max(...deptos.map((d) => d.capacidad), 1);
  const elegido = deptos.find((d) => String(d.id) === depto);
  const cap = elegido?.capacidad ?? capMax;
  const noches = useMemo(() => (ingreso && egreso ? Math.round((Date.parse(egreso) - Date.parse(ingreso)) / DIA) : 0), [ingreso, egreso]);

  // "Consultar" en una tarjeta → preselecciona ese departamento (un solo listener delegado en el documento).
  useEffect(() => {
    const h = (e: MouseEvent) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("[data-consultar]");
      if (b) setDepto(b.dataset.consultar!);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nombre = String(f.get("nombre")).trim();
    const telefono = String(f.get("telefono")).trim();
    const personas = Number(f.get("personas"));
    const mensaje = String(f.get("mensaje")).trim();
    const fallo =
      nombre.length < 2 ? ["Escribí tu nombre.", "f-nombre"] :
      telefono.replace(/\D/g, "").length < 6 ? ["Escribí un teléfono o WhatsApp para responderte.", "f-tel"] :
      !depto ? ["Elegí un departamento.", "f-depto"] :
      !ingreso ? ["Elegí la fecha de ingreso.", "f-in"] :
      noches < 1 ? ["La fecha de egreso tiene que ser posterior al ingreso.", "f-out"] :
      noches < nochesMinimas ? [`La estadía mínima es de ${nochesMinimas} noches.`, "f-out"] :
      !(personas >= 1) ? ["Indicá cuántas personas son.", "f-pers"] :
      personas > cap ? [`${elegido?.nombre ?? "El departamento"} es para hasta ${cap} personas.`, "f-pers"] : null;
    if (fallo) { setError(fallo[0]); document.getElementById(fallo[1])?.focus(); return; }
    setError("");

    const texto = [
      "Hola! Quiero consultar disponibilidad en Posada Abuela Emilia.",
      `Nombre: ${nombre}`,
      `Departamento: ${elegido?.nombre ?? "El que esté disponible"}`,
      `Ingreso: ${fecha(ingreso)} · Egreso: ${fecha(egreso)} (${noches} noches)`,
      `Personas: ${personas}`,
      mensaje && `Mensaje: ${mensaje}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");

    setEstado("enviando");
    const form = e.currentTarget;
    registrarConsulta({ nombre, telefono, departamento_id: elegido?.id ?? null, ingreso, egreso, personas, mensaje, web: String(f.get("web") ?? "") })
      .then((r) => { if (r.ok) { setEstado("ok"); form.reset(); setDepto(""); setIngreso(""); setEgreso(""); } else { setEstado(""); setError(r.mensaje ?? ""); } })
      .catch(() => setEstado(""));
  }

  if (estado === "ok") {
    return (
      <div className="form form--ok" role="status">
        <h3>¡Gracias por tu consulta!</h3>
        <p>Te respondemos a la brevedad por WhatsApp. Si no se abrió la conversación, escribinos directamente.</p>
        <button type="button" className="btn btn--borde" onClick={() => setEstado("")}>Hacer otra consulta</button>
      </div>
    );
  }

  return (
    <form className="form" id="form-reserva" onSubmit={enviar} noValidate>
      <div className="campo campo--ancho">
        <label htmlFor="f-nombre">Nombre y apellido</label>
        <input id="f-nombre" name="nombre" autoComplete="name" required maxLength={120} />
      </div>
      <div className="campo">
        <label htmlFor="f-tel">Teléfono / WhatsApp</label>
        <input id="f-tel" name="telefono" type="tel" autoComplete="tel" inputMode="tel" required maxLength={30} />
      </div>
      <div className="campo">
        <label htmlFor="f-depto">Departamento</label>
        <select id="f-depto" name="depto" required value={depto} onChange={(e) => setDepto(e.target.value)}>
          <option value="">Elegí uno</option>
          {deptos.map((d) => <option key={d.id} value={d.id}>{d.nombre} (hasta {d.capacidad})</option>)}
          <option value="0">Cualquiera disponible</option>
        </select>
      </div>
      <div className="campo">
        <label htmlFor="f-in">Ingreso</label>
        <input id="f-in" name="ingreso" type="date" required min={hoy()} value={ingreso}
          onChange={(e) => { const v = e.target.value; setIngreso(v); if (v && (!egreso || egreso <= v)) setEgreso(sumar(v, nochesMinimas)); }} />
      </div>
      <div className="campo">
        <label htmlFor="f-out">Egreso</label>
        <input id="f-out" name="egreso" type="date" required min={ingreso ? sumar(ingreso, 1) : hoy()} value={egreso} onChange={(e) => setEgreso(e.target.value)} />
      </div>
      <div className="campo">
        <label htmlFor="f-pers">Personas</label>
        <input id="f-pers" name="personas" type="number" min={1} max={cap} defaultValue={2} inputMode="numeric" required />
      </div>
      <div className="campo">
        <span className="campo__label">Noches</span>
        <output className={`noches${noches > 0 && noches < nochesMinimas ? " noches--aviso" : ""}`} htmlFor="f-in f-out">
          {noches > 0 ? `${noches} ${noches === 1 ? "noche" : "noches"}` : "–"}
        </output>
      </div>
      <div className="campo campo--ancho">
        <label htmlFor="f-msg">Mensaje <small>(opcional)</small></label>
        <textarea id="f-msg" name="mensaje" rows={3} maxLength={2000} />
      </div>
      <input className="trampa" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error && <p className="form__error" role="alert">{error}</p>}
      <button className="btn btn--wa campo--ancho" type="submit" disabled={estado === "enviando"}>
        <IconoWa /> Consultar disponibilidad por WhatsApp
      </button>
    </form>
  );
}

export function IconoWa({ size = 20 }: { size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size}><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>
  );
}
