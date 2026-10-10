"use client";

import { useActionState } from "react";
import { guardarDepartamento, type EstadoForm } from "../../acciones";

export interface DatosDepto { id?: number; nombre: string; capacidad: number; descripcion: string; caracteristicas: string[]; activo: boolean; orden: number }

export function DeptoForm({ depto }: { depto: DatosDepto }) {
  const [estado, accion, guardando] = useActionState<EstadoForm | null, FormData>(guardarDepartamento, null);
  return (
    <form action={accion} className="adm-bloque adm-form">
      <h2>Datos</h2>
      {depto.id && <input type="hidden" name="id" value={depto.id} />}
      <div className="adm-grid">
        <div className="campo adm-grid__ancho">
          <label htmlFor="d-nombre">Nombre</label>
          <input id="d-nombre" name="nombre" defaultValue={depto.nombre} required maxLength={80} placeholder="Departamento G" />
        </div>
        <div className="campo">
          <label htmlFor="d-cap">Capacidad (personas)</label>
          <input id="d-cap" name="capacidad" type="number" min={1} max={30} defaultValue={depto.capacidad} required inputMode="numeric" />
        </div>
        <div className="campo">
          <label htmlFor="d-orden">Orden en el sitio</label>
          <input id="d-orden" name="orden" type="number" min={0} max={999} defaultValue={depto.orden} inputMode="numeric" />
        </div>
        <div className="campo adm-grid__ancho">
          <label htmlFor="d-desc">Descripción <small>(opcional)</small></label>
          <textarea id="d-desc" name="descripcion" rows={3} maxLength={2000} defaultValue={depto.descripcion} placeholder="Ej.: Dos dormitorios, uno en suite, con aire acondicionado y patio propio." />
        </div>
        <div className="campo adm-grid__ancho">
          <label htmlFor="d-car">Características <small>(una por línea)</small></label>
          <textarea id="d-car" name="caracteristicas" rows={4} defaultValue={depto.caracteristicas.join("\n")} />
        </div>
        <label className="adm-check adm-grid__ancho">
          <input type="checkbox" name="activo" defaultChecked={depto.activo} /> Visible en el sitio
        </label>
      </div>
      {estado && <p className={estado.ok ? "adm-aviso" : "adm-error"} role="status">{estado.mensaje}</p>}
      <div><button className="btn" disabled={guardando}>{guardando ? "Guardando…" : depto.id ? "Guardar cambios" : "Crear y agregar fotos"}</button></div>
    </form>
  );
}
