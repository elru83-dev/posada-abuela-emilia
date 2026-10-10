import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Solo corre en /admin: refresca la sesión de Supabase y manda al login si no hay usuario. El sitio público no pasa por acá. */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const esLogin = request.nextUrl.pathname.startsWith("/admin/login");
  if (!url || !key) return esLogin ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login?error=demo", request.url));

  let response = NextResponse.next({ request });
  const sb = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await sb.auth.getUser();
  if (!user && !esLogin) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (user && esLogin && !request.nextUrl.searchParams.has("error")) return NextResponse.redirect(new URL("/admin", request.url));
  return response;
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
