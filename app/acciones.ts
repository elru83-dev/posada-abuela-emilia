"use server";

import { supabase, MODO_DEMO } from "@/lib/supabase";

export interface DatosConsulta {
  nombre: string; telefono: string; departamento_id: number | null;
  ingreso: string; egreso: string; personas: number; mensaje: string; web?: string;
}

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Guarda la consulta de reserva. Se valida acá también: nunca confiar solo en el navegador. */
export async function registrarConsulta(d: DatosConsulta): Promise<{ ok: boolean; mensaje?: string }> {
  if (d.web) return { ok: true }; // campo trampa para bots: se descarta en silencio
  const nombre = String(d.nombre ?? "").trim().slice(0, 120);
  const telefono = String(d.telefono ?? "").replace(/[^\d+\-\s()]/g, "").trim().slice(0, 30);
  const personas = Math.trunc(Number(d.personas));
  if (nombre.length < 2) return { ok: false, mensaje: "Escribí tu nombre." };
  if (telefono.replace(/\D/g, "").length < 6) return { ok: false, mensaje: "Revisá el teléfono." };
  if (!FECHA.test(d.ingreso) || !FECHA.test(d.egreso) || d.egreso <= d.ingreso) return { ok: false, mensaje: "Revisá las fechas." };
  if (!(personas >= 1 && personas <= 30)) return { ok: false, mensaje: "Revisá la cantidad de personas." };
  if (MODO_DEMO) return { ok: true };

  const { error } = await supabase!.from("consultas").insert({
    nombre, telefono, personas, ingreso: d.ingreso, egreso: d.egreso,
    departamento_id: Number(d.departamento_id) || null,
    mensaje: String(d.mensaje ?? "").trim().slice(0, 2000) || null,
  });
  if (error) {
    console.error("[consultas]", error.message);
    return { ok: false, mensaje: "No pudimos guardar la consulta, pero el mensaje de WhatsApp sí se abrió." };
  }
  return { ok: true };
}
