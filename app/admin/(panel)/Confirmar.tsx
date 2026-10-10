"use client";

/** Formulario de una acción destructiva con confirmación nativa. */
export function BotonConfirmar({ accion, campos, texto, etiqueta, className = "btn btn--peligro btn--chico" }: {
  accion: (f: FormData) => Promise<void>; campos: Record<string, string | number>; texto: string; etiqueta: string; className?: string;
}) {
  return (
    <form action={accion} onSubmit={(e) => { if (!confirm(texto)) e.preventDefault(); }}>
      {Object.entries(campos).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button className={className}>{etiqueta}</button>
    </form>
  );
}
