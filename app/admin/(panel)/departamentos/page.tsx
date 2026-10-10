import Link from "next/link";
import { requerirAdmin } from "@/lib/supabase-server";
import { urlImagen } from "@/lib/urls";
import { SwitchVisible } from "./SwitchVisible";

interface Fila { id: number; nombre: string; capacidad: number; activo: boolean; orden: number; fotos: { path: string; orden: number }[] }

export default async function Departamentos({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const { sb } = await requerirAdmin();
  const { aviso } = await searchParams;
  // Una sola consulta: departamentos + rutas de sus fotos ordenadas (para portada y cantidad).
  const { data, error } = await sb.from("departamentos")
    .select("id,nombre,capacidad,activo,orden,fotos(path,orden)")
    .order("orden").order("id")
    .order("orden", { referencedTable: "fotos" });
  if (error) throw new Error(error.message);
  const lista = data as Fila[];

  return (
    <>
      <div className="adm__cabecera">
        <h1 className="adm__titulo">Departamentos</h1>
        <Link href="/admin/departamentos/nuevo" className="btn">+ Nuevo departamento</Link>
      </div>
      {aviso === "eliminado" && <p className="adm-aviso">Departamento eliminado.</p>}
      <p className="adm-ayuda" style={{ marginBottom: 16 }}>Tocá un departamento para cambiar sus fotos, capacidad o descripción.</p>
      <ul className="adm-deptos">
        {lista.map((d) => (
          <li key={d.id} className={`adm-depto${d.activo ? "" : " adm-depto--oculto"}`}>
            <Link href={`/admin/departamentos/${d.id}`} className="adm-depto__link">
              <span className="adm-depto__img">
                {d.fotos[0]
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={urlImagen(d.fotos[0].path)} alt="" loading="lazy" />
                  : <span>Sin fotos</span>}
              </span>
              <span className="adm-depto__datos">
                <b>{d.nombre}</b>
                <span>Hasta {d.capacidad} personas · {d.fotos.length} {d.fotos.length === 1 ? "foto" : "fotos"}</span>
              </span>
            </Link>
            <SwitchVisible id={d.id} activo={d.activo} />
          </li>
        ))}
      </ul>
      {lista.length === 0 && <p className="adm-bloque">Todavía no hay departamentos. Creá el primero con el botón de arriba.</p>}
    </>
  );
}
