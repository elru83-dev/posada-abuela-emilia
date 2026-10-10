import Link from "next/link";
import { requerirAdmin } from "@/lib/supabase-server";
import { AtractivoForm } from "../AtractivoForm";

export default async function NuevoAtractivo() {
  await requerirAdmin();
  return (
    <>
      <p className="adm-migas"><Link href="/admin/san-jose">← ¿Por qué San José?</Link></p>
      <h1 className="adm__titulo">Nueva tarjeta</h1>
      <AtractivoForm a={{}} />
    </>
  );
}
