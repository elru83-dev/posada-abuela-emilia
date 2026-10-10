import Link from "next/link";
import { requerirAdmin } from "@/lib/supabase-server";

export default async function PanelInicio() {
  const { sb } = await requerirAdmin();
  // Solo conteos (head: true): no trae filas.
  const [pend, deptos, fotos] = await Promise.all([
    sb.from("consultas").select("id", { count: "exact", head: true }).eq("atendida", false),
    sb.from("departamentos").select("id", { count: "exact", head: true }).eq("activo", true),
    sb.from("fotos").select("id", { count: "exact", head: true }),
  ]);
  return (
    <>
      <h1 className="adm__titulo">Hola 👋</h1>
      <div className="adm-tiles">
        <Link href="/admin/consultas" className={`adm-tile${pend.count ? " adm-tile--alerta" : ""}`}><strong>{pend.count ?? 0}</strong><span>consultas sin atender</span></Link>
        <Link href="/admin/departamentos" className="adm-tile"><strong>{deptos.count ?? 0}</strong><span>departamentos publicados</span></Link>
        <Link href="/admin/fotos" className="adm-tile"><strong>{fotos.count ?? 0}</strong><span>fotos en el sitio</span></Link>
      </div>
      <div className="adm-bloque">
        <h2>¿Qué querés hacer?</h2>
        <div className="adm-acciones">
          <Link className="btn" href="/admin/departamentos">Fotos y datos de los departamentos</Link>
          <Link className="btn btn--borde" href="/admin/fotos">Portada, espacios y Nosotros</Link>
          <Link className="btn btn--borde" href="/admin/consultas">Ver consultas</Link>
        </div>
      </div>
    </>
  );
}
