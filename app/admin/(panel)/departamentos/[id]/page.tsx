import Link from "next/link";
import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/supabase-server";
import type { Foto } from "@/lib/types";
import { DeptoForm, type DatosDepto } from "../DeptoForm";
import { GestorFotos } from "../../GestorFotos";
import { BotonConfirmar } from "../../Confirmar";
import { eliminarDepartamento } from "../../../acciones";

export default async function EditarDepto({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ nuevo?: string }> }) {
  const { sb } = await requerirAdmin();
  const [{ id }, { nuevo }] = await Promise.all([params, searchParams]);
  const { data } = await sb.from("departamentos")
    .select("id,nombre,capacidad,descripcion,caracteristicas,activo,orden,fotos(id,path,alt,orden)")
    .eq("id", Number(id))
    .order("orden", { referencedTable: "fotos" }).order("id", { referencedTable: "fotos" })
    .maybeSingle();
  if (!data) notFound();
  const { fotos, ...depto } = data as DatosDepto & { id: number; fotos: Foto[] };

  return (
    <>
      <p className="adm-migas"><Link href="/admin/departamentos">← Departamentos</Link></p>
      <h1 className="adm__titulo">{depto.nombre}</h1>
      {nuevo && <p className="adm-aviso">Departamento creado. Ahora subí las fotos.</p>}

      <section className="adm-bloque">
        <h2>Fotos</h2>
        <p className="adm-ayuda">La primera es la portada de la tarjeta. Ordenalas con las flechas o tocá ★ para elegir otra portada. Los cambios se publican al instante.</p>
        <GestorFotos seccion="departamento" departamentoId={depto.id} fotosIniciales={fotos} altPorDefecto={depto.nombre} />
      </section>

      <DeptoForm depto={depto} />

      <section className="adm-bloque adm-peligro">
        <h2>Eliminar departamento</h2>
        <p className="adm-ayuda">Se borra junto con todas sus fotos. Si solo querés sacarlo del sitio por un tiempo, destildá “Visible en el sitio”.</p>
        <BotonConfirmar accion={eliminarDepartamento} campos={{ id: depto.id }} etiqueta="Eliminar departamento"
          texto={`¿Eliminar ${depto.nombre} y sus ${fotos.length} fotos? No se puede deshacer.`} />
      </section>
    </>
  );
}
