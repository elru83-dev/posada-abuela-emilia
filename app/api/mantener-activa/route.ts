import { NextResponse, type NextRequest } from "next/server";
import { supabase, MODO_DEMO } from "@/lib/supabase";

/**
 * Llamada diaria de Vercel Cron (ver vercel.json). El plan gratuito de Supabase pausa el proyecto
 * tras 7 días sin actividad; una consulta mínima por día lo mantiene activo aunque el sitio no tenga visitas.
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secreto = process.env.CRON_SECRET;
  if (secreto && req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (MODO_DEMO) return NextResponse.json({ ok: true, demo: true });
  // head:true → no trae filas, solo toca la base.
  const { error } = await supabase!.from("departamentos").select("id", { count: "exact", head: true });
  return NextResponse.json({ ok: !error, error: error?.message }, { status: error ? 500 : 200 });
}
