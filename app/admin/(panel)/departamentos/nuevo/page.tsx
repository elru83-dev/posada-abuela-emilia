import Link from "next/link";
import { requerirAdmin } from "@/lib/supabase-server";
import { DeptoForm } from "../DeptoForm";

export default async function NuevoDepto() {
  await requerirAdmin();
  return (
    <>
      <p className="adm-migas"><Link href="/admin/departamentos">← Departamentos</Link></p>
      <h1 className="adm__titulo">Nuevo departamento</h1>
      <DeptoForm depto={{ nombre: "", capacidad: 4, descripcion: "", caracteristicas: ["Cocina equipada", "WiFi y Smart TV", "Cochera privada"], activo: true, orden: 99 }} />
      <p className="adm-ayuda" style={{ marginTop: 12 }}>Después de crearlo vas a poder subir las fotos.</p>
    </>
  );
}
