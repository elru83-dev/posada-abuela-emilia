import Link from "next/link";
import { requerirAdmin } from "@/lib/supabase-server";
import { marcarConsulta, eliminarConsulta } from "../../acciones";
import { BotonConfirmar } from "../Confirmar";

interface Fila {
  id: number; nombre: string; telefono: string; ingreso: string; egreso: string; personas: number;
  mensaje: string | null; atendida: boolean; created_at: string; departamento: { nombre: string } | null;
}

const POR_PAGINA = 50;
const fecha = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");
const DIA = 864e5;

/** Link de WhatsApp al huésped: celulares argentinos sin código de país se completan con 549. */
function waHuesped(tel: string, nombre: string, ingreso: string) {
  let n = tel.replace(/\D/g, "").replace(/^00/, "");
  if (!tel.trim().startsWith("+") && !n.startsWith("54")) n = `549${n.replace(/^0/, "").replace(/^(\d{2,4})15/, "$1")}`;
  const msg = `Hola ${nombre.split(" ")[0]}! Te escribimos de Posada Abuela Emilia por tu consulta para el ${fecha(ingreso)}.`;
  return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
}

export default async function Consultas({ searchParams }: { searchParams: Promise<{ ver?: string; p?: string }> }) {
  const { sb } = await requerirAdmin();
  const { ver = "pendientes", p = "1" } = await searchParams;
  const pagina = Math.max(1, Number(p) || 1);
  let q = sb.from("consultas")
    .select("id,nombre,telefono,ingreso,egreso,personas,mensaje,atendida,created_at,departamento:departamentos(nombre)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
  if (ver === "pendientes") q = q.eq("atendida", false);
  const { data, count, error } = await q;
  if (error) throw new Error(error.message);
  const filas = data as unknown as Fila[];
  const paginas = Math.ceil((count ?? 0) / POR_PAGINA);

  return (
    <>
      <h1 className="adm__titulo">Consultas</h1>
      <nav className="adm-filtros" aria-label="Filtrar">
        <Link href="/admin/consultas" aria-current={ver === "pendientes" ? "page" : undefined}>Sin atender</Link>
        <Link href="/admin/consultas?ver=todas" aria-current={ver === "todas" ? "page" : undefined}>Todas</Link>
      </nav>
      {filas.length === 0 ? (
        <p className="adm-bloque">{ver === "pendientes" ? "No hay consultas sin atender." : "Todavía no llegaron consultas."}</p>
      ) : (
        <ul className="adm-consultas">
          {filas.map((c) => {
            const noches = Math.round((Date.parse(c.egreso) - Date.parse(c.ingreso)) / DIA);
            return (
              <li key={c.id} className={`adm-consulta${c.atendida ? " adm-consulta--ok" : ""}`}>
                <div className="adm-consulta__cab">
                  <b>{c.nombre}</b>
                  <time dateTime={c.created_at}>{new Date(c.created_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" })}</time>
                </div>
                <dl className="adm-consulta__datos">
                  <div><dt>Departamento</dt><dd>{c.departamento?.nombre ?? "Cualquiera"}</dd></div>
                  <div><dt>Fechas</dt><dd>{fecha(c.ingreso)} → {fecha(c.egreso)} ({noches} {noches === 1 ? "noche" : "noches"})</dd></div>
                  <div><dt>Personas</dt><dd>{c.personas}</dd></div>
                  <div><dt>Teléfono</dt><dd>{c.telefono}</dd></div>
                </dl>
                {c.mensaje && <p className="adm-consulta__msg">{c.mensaje}</p>}
                <div className="adm-acciones">
                  <a className="btn btn--wa btn--chico" href={waHuesped(c.telefono, c.nombre, c.ingreso)} target="_blank" rel="noopener">Responder por WhatsApp</a>
                  <form action={marcarConsulta}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="atendida" value={String(!c.atendida)} />
                    <button className="btn btn--borde btn--chico">{c.atendida ? "Marcar sin atender" : "Marcar atendida"}</button>
                  </form>
                  <BotonConfirmar accion={eliminarConsulta} campos={{ id: c.id }} etiqueta="Eliminar" className="adm-link-peligro" texto={`¿Eliminar la consulta de ${c.nombre}?`} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {paginas > 1 && (
        <nav className="adm-filtros" aria-label="Páginas" style={{ marginTop: 16 }}>
          {Array.from({ length: paginas }, (_, i) => (
            <Link key={i} href={`/admin/consultas?ver=${ver}&p=${i + 1}`} aria-current={pagina === i + 1 ? "page" : undefined}>{i + 1}</Link>
          ))}
        </nav>
      )}
    </>
  );
}
