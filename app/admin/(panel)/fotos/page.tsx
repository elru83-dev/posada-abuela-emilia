import { requerirAdmin } from "@/lib/supabase-server";
import { SECCIONES_SITIO, type Foto, type Seccion } from "@/lib/types";
import { GestorFotos } from "../GestorFotos";

const MAX: Record<string, number> = { portada: 3, espacios: 30, nosotros: 3 };

export default async function FotosSitio() {
  const { sb } = await requerirAdmin();
  const { data, error } = await sb.from("fotos").select("id,path,alt,orden,seccion")
    .in("seccion", SECCIONES_SITIO.map((s) => s.clave)).order("orden").order("id");
  if (error) throw new Error(error.message);
  const por = (s: Seccion) => (data as (Foto & { seccion: Seccion })[]).filter((f) => f.seccion === s);

  return (
    <>
      <h1 className="adm__titulo">Fotos del sitio</h1>
      <p className="adm-ayuda" style={{ marginBottom: 16 }}>Las fotos de cada departamento se cargan desde <a href="/admin/departamentos">Departamentos</a>.</p>
      {SECCIONES_SITIO.map((s) => (
        <section className="adm-bloque" key={s.clave}>
          <h2>{s.titulo}</h2>
          <p className="adm-ayuda">{s.ayuda}</p>
          <GestorFotos seccion={s.clave} fotosIniciales={por(s.clave)} max={MAX[s.clave]} />
        </section>
      ))}
    </>
  );
}
