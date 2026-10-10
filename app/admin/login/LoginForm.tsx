"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseNavegador } from "@/lib/supabase-browser";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function ingresar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCargando(true);
    const f = new FormData(e.currentTarget);
    const { error } = await supabaseNavegador().auth.signInWithPassword({
      email: String(f.get("email")).trim(),
      password: String(f.get("password")),
    });
    if (error) { setError("Email o contraseña incorrectos."); setCargando(false); return; }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={ingresar} className="adm-form">
      <div className="campo"><label htmlFor="l-email">Email</label><input id="l-email" name="email" type="email" autoComplete="username" required /></div>
      <div className="campo"><label htmlFor="l-pass">Contraseña</label><input id="l-pass" name="password" type="password" autoComplete="current-password" required /></div>
      {error && <p className="adm-error" role="alert">{error}</p>}
      <button className="btn" disabled={cargando}>{cargando ? "Ingresando…" : "Ingresar"}</button>
    </form>
  );
}
