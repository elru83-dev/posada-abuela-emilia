"use client";

import { useActionState } from "react";
import { guardarTextosSanJose, type EstadoForm } from "../../acciones";
import type { TextosSitio } from "@/lib/types";

export function TextosForm({ t }: { t: TextosSitio }) {
  const [estado, accion, guardando] = useActionState<EstadoForm | null, FormData>(guardarTextosSanJose, null);
  return (
    <form action={accion} className="adm-bloque adm-form">
      <h2>Encabezado de la sección</h2>
      <div className="adm-grid">
        <div className="campo">
          <label htmlFor="t-eye">Texto chico de arriba</label>
          <input id="t-eye" name="sanjose_eyebrow" defaultValue={t.sanjose_eyebrow} maxLength={60} />
        </div>
        <div className="campo">
          <label htmlFor="t-tit">Título</label>
          <input id="t-tit" name="sanjose_titulo" defaultValue={t.sanjose_titulo} required maxLength={120} />
        </div>
      </div>
      {estado && <p className={estado.ok ? "adm-aviso" : "adm-error"} role="status">{estado.mensaje}</p>}
      <div><button className="btn btn--borde" disabled={guardando}>{guardando ? "Guardando…" : "Guardar encabezado"}</button></div>
    </form>
  );
}
