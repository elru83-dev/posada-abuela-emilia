import Link from "next/link";
import { requerirAdmin } from "@/lib/supabase-server";
import { TEXTOS_POR_DEFECTO } from "@/lib/datos-iniciales";
import type { Atractivo, TextosSitio } from "@/lib/types";
import { TextosForm } from "./TextosForm";
import { ListaAtractivos } from "./ListaAtractivos";

const AVISOS: Record<string, string> = { creado: "Tarjeta creada y publicada.", eliminado: "Tarjeta eliminada." };

export default async function SanJose({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const { sb } = await requerirAdmin();
  const { aviso } = await searchParams;
  const [atr, tx] = await Promise.all([
    sb.from("atractivos").select("id,titulo,texto,foto,link_url,link_texto,activo,orden").order("orden").order("id"),
    sb.from("textos_sitio").select("clave,valor").in("clave", Object.keys(TEXTOS_POR_DEFECTO)),
  ]);
  if (atr.error) {
    return (
      <>
        <h1 className="adm__titulo">¿Por qué San José?</h1>
        <p className="adm-error">Falta preparar la base: corré <code>supabase/migracion-san-jose.sql</code> en Supabase (SQL Editor) y recargá esta página.</p>
      </>
    );
  }
  const textos: TextosSitio = { ...TEXTOS_POR_DEFECTO };
  for (const r of (tx.data ?? []) as { clave: keyof TextosSitio; valor: string }[]) textos[r.clave] = r.valor;

  return (
    <>
      <div className="adm__cabecera">
        <h1 className="adm__titulo">¿Por qué San José?</h1>
        <Link href="/admin/san-jose/nuevo" className="btn">+ Nueva tarjeta</Link>
      </div>
      {aviso && AVISOS[aviso] && <p className="adm-aviso">{AVISOS[aviso]}</p>}
      <TextosForm t={textos} />
      <section className="adm-bloque">
        <h2>Tarjetas</h2>
        <p className="adm-ayuda">Ordenalas con ↑ ↓, ocultalas sin borrarlas con el botón de la derecha, o tocá una para cambiar foto, texto y link. Si no queda ninguna visible, la sección no se muestra en el sitio.</p>
        <ListaAtractivos iniciales={atr.data as Atractivo[]} />
      </section>
    </>
  );
}
