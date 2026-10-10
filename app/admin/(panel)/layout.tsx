import Link from "next/link";
import { requerirAdmin } from "@/lib/supabase-server";
import { POSADA } from "@/lib/site";
import { salir } from "../acciones";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requerirAdmin();
  return (
    <div className="adm">
      <header className="adm__barra">
        <Link href="/admin" className="adm__marca">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSADA.isotipo} alt="" width={34} height={34} /><span>Panel</span>
        </Link>
        <nav className="adm__nav" aria-label="Panel">
          <Link href="/admin/departamentos">Departamentos</Link>
          <Link href="/admin/fotos">Fotos del sitio</Link>
          <Link href="/admin/san-jose">San José</Link>
          <Link href="/admin/consultas">Consultas</Link>
          <a href="/" target="_blank" rel="noopener">Ver sitio ↗</a>
        </nav>
        <form action={salir} className="adm__usuario">
          <span title={user.email}>{user.email}</span>
          <button className="btn btn--borde btn--chico">Salir</button>
        </form>
      </header>
      <main className="adm__contenido">{children}</main>
    </div>
  );
}
