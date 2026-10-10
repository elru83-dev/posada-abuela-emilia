"use client";

import { useOptimistic, useTransition } from "react";
import { alternarDepartamento } from "../../acciones";

export function SwitchVisible({ id, activo }: { id: number; activo: boolean }) {
  const [valor, setValor] = useOptimistic(activo);
  const [, iniciar] = useTransition();
  return (
    <button type="button" className={`adm-switch${valor ? " adm-switch--on" : ""}`} aria-pressed={valor}
      onClick={() => iniciar(async () => { setValor(!valor); await alternarDepartamento(id, !valor); })}>
      {valor ? "Visible" : "Oculto"}
    </button>
  );
}
