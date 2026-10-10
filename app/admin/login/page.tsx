import type { Metadata } from "next";
import { POSADA } from "@/lib/site";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Ingresar al panel", robots: { index: false } };

const ERRORES: Record<string, string> = {
  permiso: "Tu usuario no tiene permiso de administrador. Pedile al responsable técnico que te habilite.",
  demo: "El panel necesita Supabase configurado (variables de entorno en Vercel).",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="adm-login">
      <div className="adm-login__caja">
        <div className="adm-login__marca">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSADA.isotipo} alt="" width={56} height={56} />
          <span>Panel<br /><b>Abuela Emilia</b></span>
        </div>
        {error && ERRORES[error] && <p className="adm-error" role="alert">{ERRORES[error]}</p>}
        <LoginForm />
      </div>
    </main>
  );
}
