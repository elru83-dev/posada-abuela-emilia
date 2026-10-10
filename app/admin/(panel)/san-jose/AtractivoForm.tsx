"use client";

import { useActionState } from "react";
import { guardarAtractivo, type EstadoForm } from "../../acciones";
import { FotoUnica } from "../FotoUnica";
import type { Atractivo } from "@/lib/types";

export function AtractivoForm({ a }: { a: Partial<Atractivo> }) {
  const [estado, accion, guardando] = useActionState<EstadoForm | null, FormData>(guardarAtractivo, null);
  return (
    <form action={accion} className="adm-bloque adm-form">
      {a.id && <input type="hidden" name="id" value={a.id} />}
      <div className="adm-grid adm-grid--foto">
        <div className="campo">
          <span className="campo__label">Foto</span>
          <FotoUnica name="foto" inicial={a.foto ?? null} carpeta="atractivos" />
        </div>
        <div className="adm-form">
          <div className="campo">
            <label htmlFor="a-titulo">Título</label>
            <input id="a-titulo" name="titulo" defaultValue={a.titulo ?? ""} required maxLength={80} placeholder="Ej.: Termas de San José" />
          </div>
          <div className="campo">
            <label htmlFor="a-texto">Texto <small>(hasta 600 caracteres)</small></label>
            <textarea id="a-texto" name="texto" rows={4} maxLength={600} defaultValue={a.texto ?? ""} />
          </div>
        </div>
        <div className="campo">
          <label htmlFor="a-url">Link <small>(opcional)</small></label>
          <input id="a-url" name="link_url" type="text" inputMode="url" defaultValue={a.link_url ?? ""} maxLength={500} placeholder="https://www.termasdesanjose.com.ar" />
        </div>
        <div className="campo">
          <label htmlFor="a-ltxt">Texto del link <small>(opcional)</small></label>
          <input id="a-ltxt" name="link_texto" defaultValue={a.link_texto ?? ""} maxLength={40} placeholder="Más información" />
        </div>
        <label className="adm-check adm-grid__ancho">
          <input type="checkbox" name="activo" defaultChecked={a.activo ?? true} /> Visible en el sitio
        </label>
      </div>
      {estado && <p className={estado.ok ? "adm-aviso" : "adm-error"} role="status">{estado.mensaje}</p>}
      <div><button className="btn" disabled={guardando}>{guardando ? "Guardando…" : a.id ? "Guardar cambios" : "Crear tarjeta"}</button></div>
    </form>
  );
}
