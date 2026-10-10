import Link from "next/link";
import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/supabase-server";
import type { Atractivo } from "@/lib/types";
import { AtractivoForm } from "../AtractivoForm";
import { BotonConfirmar } from "../../Confirmar";
import { eliminarAtractivo } from "../../../acciones";

export default async function EditarAtractivo({ params }: { params: Promise<{ id: string }> }) {
  const { sb } = await requerirAdmin();
  const { id } = await params;
  const { data } = await sb.from("atractivos").select("id,titulo,texto,foto,link_url,link_texto,activo,orden").eq("id", Number(id)).maybeSingle();
  if (!data) notFound();
  const a = data as Atractivo;
  return (
    <>
      <p className="adm-migas"><Link href="/admin/san-jose">← ¿Por qué San José?</Link></p>
      <h1 className="adm__titulo">{a.titulo}</h1>
      <AtractivoForm a={a} />
      <section className="adm-bloque adm-peligro">
        <h2>Eliminar tarjeta</h2>
        <p className="adm-ayuda">Si solo querés sacarla del sitio por un tiempo, destildá “Visible en el sitio”.</p>
        <BotonConfirmar accion={eliminarAtractivo} campos={{ id: a.id }} etiqueta="Eliminar tarjeta" texto={`¿Eliminar “${a.titulo}”? No se puede deshacer.`} />
      </section>
    </>
  );
}
