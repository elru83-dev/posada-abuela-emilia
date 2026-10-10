import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { MODO_DEMO } from "./supabase";

/** Cliente con la sesión del usuario (cookies). Solo para el panel: el sitio público usa el cliente anónimo y queda estático. */
export async function supabaseServidor() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (lista) => {
        try { lista.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* llamado desde un Server Component: el proxy ya refresca la sesión */ }
      },
    },
  });
}

/** Exige usuario logueado y registrado en la tabla admins. Devuelve el cliente listo para usar. */
export async function requerirAdmin() {
  const sb = await supabaseServidor(); // lee cookies: el panel siempre se renderiza por request, nunca estático
  if (MODO_DEMO) redirect("/admin/login?error=demo");
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: esAdmin } = await sb.rpc("es_admin");
  if (!esAdmin) redirect("/admin/login?error=permiso");
  return { sb, user };
}
